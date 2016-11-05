'use strict'

const path = require('path')
const { exec, spawn } = require('child_process')
let _; const { extend } = _ = require('lodash')
const { Document, getClient } = require('camo')
const fs = require('fs-promise')
const mergeStream = require('merge-stream')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const config = require('../../config')
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
          url: `http${config.use_https ? 's' : ''}://${config.host}:${config.port}/api/webhook`,
          content_type: 'json'
        }
      }

      try {
        await gh
          .patch(`/repos/${this.owner}/${this.name}/hooks/${this.webhook_id}`, hook)
      } catch (e) {
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
      await gh
        .delete(`/repos/${this.owner}/${this.name}/hooks/${this.webhook_id}`)
        .catch((err) => {
          if (!err.response.status === 404) {
            console.error('Failed to delete webhook')
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
    await this.stop()
    await rimraf(this.dir)
  }

  async deploy() {
    await this.ensureGitRepo()
    await this.stop()
    await this.fetchLatest()
    await this.start()
  }

  async ensureGitRepo() {
    await mkdirp(this.dir)
    await new Promise((resolve, reject) =>
      exec('git init', { cwd: this.dir }, (err) => err ? reject(err) : resolve()))
  }

  async fetchLatest() {
    const encoding = 'utf8'
    const repoUrl = `https://${config.github_access_token}:x-oauth-basic@github.com/${this.owner}/${this.name}.git`

    console.log('Fetching latest for', this.name)

    await new Promise((resolve, reject) =>
      exec(`git fetch ${repoUrl}`, { cwd: this.dir, encoding }, (err) => err ? reject(err) : resolve()))
    await new Promise((resolve, reject) =>
      exec('git checkout FETCH_HEAD', { cwd: this.dir, encoding }, (err) => err ? reject(err) : resolve()))

    console.log('Latest fetched for', this.name)
  }

  async start() {
    await this.runScript('start')
  }

  async stop() {
    await this.runScript('stop')
    await rimraf(path.join(this.dir, '.hubbard'))
  }

  async runScript(s) {
    await mkdirp(path.join(this.dir, '.hubbard/scripts'))
    await mkdirp(path.join(this.dir, '.hubbard/logs'))

    const scriptPath = path.join(this.dir, '.hubbard/scripts', s)
    const logfilePath = path.join(this.dir, '.hubbard/logs', `${s}.log`)

    await fs.writeFile(scriptPath, this[`${s}_script`])
    await fs.chmod(scriptPath, 500)

    const proc = spawn(scriptPath, { cwd: this.dir, encoding: 'utf8', env: process.env })

    const logStream = mergeStream(proc.stdout, proc.stderr)
    const logfileStream = fs.createWriteStream(logfilePath, 'utf8')
    logStream.pipe(logfileStream)

    await new Promise((resolve, reject) =>
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(`Script exited with non-zero exit code ${code}`)
        } else {
          resolve()
        }
      }))
  }

  get dir() {
    return path.join(__dirname, '../../.repos', this.name)
  }

  static async sync() {
    console.log('Syncing repositories...')

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

    console.log('Finished syncing repositories')

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
    if (db._collections.repos) {
      db._collections.repos.persistence.compactDatafile()
    }
  }
}

module.exports = Repo
