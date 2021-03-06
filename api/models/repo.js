'use strict'

const path = require('path')
const { Readable } = require('stream')
const { exec, spawn } = require('child_process')
let _; const { extend, noop } = _ = require('lodash')
const { Document, getClient } = require('camo')
const fs = require('fs-promise')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Tail = require('always-tail')
const program = require('commander')
const { error, info, verbose } = require('winston')
const _db = require('../../lib/db')
const gh = require('../../lib/github-api')

let _compactionQueued

class Repo extends Document {
  static collectionName() {
    return 'repos'
  }

  constructor() {
    super()

    this.owner = {
      type: String,
      required: true
    }
    this.name = {
      type: String,
      required: true
    }
    this.enabled = {
      type: Boolean,
      default: false
    }
    this.start_script = {
      type: String,
      required: true,
      default: '#!/bin/bash\n\n'
    }
    this.stop_script = {
      type: String,
      default: '#!/bin/bash\n\n'
    }
    this.webhook_id = Number
  }

  async preSave() {
    if (this.enabled) {
      const hook = {
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: `http${program.useHttps ? 's' : ''}://${program.host}:${program.port}/api/webhook`,
          content_type: 'json'
        }
      }

      try {
        info('Saving webhook for', this.name)
        await gh
          .patch(`/repos/${this.owner}/${this.name}/hooks/${this.webhook_id}`, hook)
      } catch (e) {
        info('Save failed... Creating new webhook')
        await gh
          .post(`/repos/${this.owner}/${this.name}/hooks`, hook)
          .then(({ data: { id } }) => {
            this.webhook_id = id
          })
      }
    }

    Repo.queueCompaction()
  }

  async postSave() {
    if (!this.enabled && this.webhook_id) {
      info('Deleting webhook for', this.name)
      await gh
        .delete(`/repos/${this.owner}/${this.name}/hooks/${this.webhook_id}`)
        .catch((err) => {
          if (!err.response.status === 404) {
            error('Failed to delete webhook for', this.name)
            throw new Error('Failed to delete webhook')
          }
        })
      await new Promise((resolve, reject) =>
        getClient()._collections.repos.update(
          { _id: this._id },
          { $unset: { webhook_id: true } },
          (err) => err
            ? reject(err)
            : resolve(err)))
    }

    if (this.enabled) {
      await this.deploy()
    } else {
      await this.cleanup()
    }
  }

  async cleanup() {
    try {
      fs.statSync(this.dir)
      verbose('Cleaning up', this.name)
      await this.stop()
      await rimraf(this.dir)
    } catch (e) {} // eslint-disable-line no-empty
  }

  async deploy() {
    info('Deploying', this.name)
    await this.ensureGitRepo()
    await this.stop()
    await this.fetchLatest()
    await this.start()
    info('Deployed', this.name)
  }

  async ensureGitRepo() {
    verbose('Ensuring git repo')
    await mkdirp(this.dir)
    await new Promise((resolve, reject) =>
      exec('git init', { cwd: this.dir }, (err) => err ? reject(err) : resolve()))
  }

  async fetchLatest() {
    const encoding = 'utf8'
    const repoUrl = `https://${program.accessToken}:x-oauth-basic@github.com/${this.owner}/${this.name}.git`

    verbose('Fetching latest for', this.name)

    await new Promise((resolve, reject) =>
      exec(`git fetch ${repoUrl}`, { cwd: this.dir, encoding }, (err) => err ? reject(err) : resolve()))
    await new Promise((resolve, reject) =>
      exec('git checkout -f FETCH_HEAD', { cwd: this.dir, encoding }, (err) => err ? reject(err) : resolve()))

    verbose('Latest fetched for', this.name)
  }

  async start() {
    verbose('Starting', this.name)
    await this.runScript('start')
  }

  async stop() {
    verbose('Stopping', this.name)
    await this.runScript('stop')
    verbose('Deleting .hubbard subdirectory')
    await rimraf(path.join(this.dir, '.hubbard'))
  }

  async runScript(s) {
    verbose(`Creating ${this.dir}/.hubbard/scripts`)
    await mkdirp(path.join(this.dir, '.hubbard/scripts'))

    const scriptPath = path.join(this.dir, '.hubbard/scripts', s)
    const logPath = path.join(this.dir, '.hubbard/log')

    verbose('Writing script', scriptPath)
    await fs.writeFile(scriptPath, this[`${s}_script`])
    await fs.chmod(scriptPath, 500)

    verbose('Spawning script:', scriptPath)
    const proc = spawn(scriptPath, {
      cwd: this.dir,
      encoding: 'utf8',
      env: extend({ LOG: logPath }, process.env)
    })

    const logfileStream = fs.createWriteStream(logPath, 'utf8')
    proc.stdout.pipe(logfileStream)

    await new Promise((resolve, reject) =>
      proc.on('close', (code) => {
        if (code !== 0) {
          error(this.name, `Script exited with non-zero exit code ${code}`)
          reject(`Script exited with non-zero exit code ${code}`)
        } else {
          verbose('Script exited with zero exit code')
          resolve()
        }
      }))
  }

  get dir() {
    return path.join(program.reposDir, this.name)
  }

  get log() {
    const logDir = path.join(this.dir, '.hubbard')
    mkdirp.sync(logDir)

    const logTail = new Tail(path.join(logDir, 'log'), '\n', { start: 0 })
    const log = new Readable({ read: noop })
    logTail.on('line', (line) => log.push(line + '\n'))

    return log
  }

  static async sync() {
    info('Syncing repositories')

    const { data: _repos } = await gh.get('/user/repos')
    const repos = await _(_repos)
      .filter((r) => r.permissions.admin)
      .map(async function(r) {
        r._id = r.id.toString()
        delete r.id
        let repo = await Repo.findOne({ _id: r._id })
        if (!repo) {
          repo = Repo.create(r)
        }
        extend(repo, {
          owner: r.owner.login,
          name: r.name,
          url: r.html_url
        })
        return await repo.save()
      })
      .value()

    info('Finished syncing repositories')

    Repo.queueCompaction()

    return repos
  }

  static queueCompaction() {
    if (_compactionQueued) {
      return
    }
    _compactionQueued = true
    setTimeout(() => this.compactDataFile().then(() => _compactionQueued = false), 5000)
  }

  static async compactDataFile() {
    const db = await _db

    verbose('Compacting datafile')
    if (db._collections.repos) {
      db._collections.repos.persistence.compactDatafile()
      verbose('Datafile compacted')
    }
  }
}

module.exports = Repo
