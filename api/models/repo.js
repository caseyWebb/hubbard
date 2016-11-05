'use strict'

const path = require('path')
const { exec, spawn } = require('child_process')
let _; const { extend } = _ = require('lodash')
const co = require('co')
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

  preSave() {
    return co(function * () {
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
          yield gh
            .patch(`/repos/${this.owner}/${this.name}/hooks/${this.webhook_id}`, hook)
        } catch (e) {
          yield gh
            .post(`/repos/${this.owner}/${this.name}/hooks`, hook)
            .then(({ data: { id } }) => {
              this.webhook_id = id
            })
        }
      }

      Repo.queueCompaction()
    }.bind(this))
  }

  postSave() {
    return co(function * () {
      if (!this.enabled && this.webhook_id) {
        yield gh
          .delete(`/repos/${this.owner}/${this.name}/hooks/${this.webhook_id}`)
          .catch((err) => {
            if (!err.response.status === 404) {
              console.error('Failed to delete webhook')
              throw new Error('Failed to delete webhook')
            }
          })
        yield new Promise((resolve, reject) =>
          getClient()._collections.repos.update(
            { _id: this._id },
            { $unset: { webhook_id: true } },
            (err) => err
              ? reject(err)
              : resolve(err)))
      }

      if (this.enabled) {
        yield this.deploy()
      } else {
        yield this.deleteGitRepo()
      }
    }.bind(this))
  }

  static * deploy(id) {
    const repo = yield this.findOne({ _id: id })
    yield repo.deploy()
  }

  * deleteGitRepo() {
    return rimraf(this.dir)
  }

  * deploy() {
    yield this.ensureGitRepo()
    this.stop()
    this.fetchLatest()
    this.start()
  }

  * ensureGitRepo() {
    try {
      yield fs.stat(this.dir)
      console.log('Repository folder already exists for', this.name)
      return
    } catch(err) {
      // check if error defined and the error code is "not exists"
      if (err && err.code === 'ENOENT') {
        yield mkdirp(this.dir)
      }
    }

    yield new Promise((resolve, reject) =>
      exec('git', ['init'], { cwd: this.dir }, (err) => err ? reject(err) : resolve()))
  }

  * fetchLatest() {
    const encoding = 'utf8'
    const repoUrl = `https://${config.github_access_token}:x-oauth-basic@github.com/${this.owner}/${this.name}.git`

    console.log('Fetching latest for', this.name)

    yield new Promise((resolve, reject) =>
      exec('git', ['fetch', repoUrl], { cwd: this.dir, encoding }, (err) => err ? reject(err) : resolve()))
    yield new Promise((resolve, reject) =>
      exec('git', ['checkout', 'FETCH_HEAD'], { cwd: this.dir, encoding }, (err) => err ? reject(err) : resolve()))

    console.log('Latest fetched for', this.name)
  }

  * start() {
    yield this.runScript('start')
  }

  * stop() {
    yield this.runScript('stop')
    yield rimraf(path.join(this.dir, '.hubbard'))
  }

  * runScript(s) {
    yield mkdirp(path.join(this.dir, '.hubbard/scripts'))
    yield mkdirp(path.join(this.dir, '.hubbard/logs'))

    const scriptPath = path.join(this.dir, '.hubbard/scripts', s)
    const logfilePath = path.join(this.dir, '.hubbard/logs', `${s}.log`)

    yield fs.write(scriptPath, this[`${s}_script`])
    yield fs.chmod(scriptPath, '+x')

    const proc = spawn(scriptPath, { cwd: this.dir, encoding: 'utf8' })

    const logStream = mergeStream(proc.stdout, proc.stderr)
    const logfileStream = fs.createWriteStream(logfilePath, 'utf8')
    logStream.pipe(logfileStream)

    yield new Promise((resolve, reject) =>
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

  static * sync() {
    console.log('Syncing repositories...')

    const { data: _repos } = yield gh.get('/user/repos')
    const repos = yield _(_repos)
      .filter((r) => r.permissions.admin)
      .map((r) => co(function * () {
        r._id = r.id.toString()
        delete r.id
        let repo = yield Repo.findOne({ _id: r._id })
        if (!repo) {
          repo = Repo.create(r)
        }
        extend(repo, {
          owner: r.owner.login,
          name: r.name,
          url: r.html_url
        })
        return yield repo.save()
      }))
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

    setTimeout(() => {
      console.log('Compacting datafile...')

      co(function * () {
        const db = yield _db
        db._collections.repos.persistence.compactDatafile()
      })
        .then(() => {
          console.log('Finished compacting datafile')
        })
        .catch((err) => {
          console.error('Error compacting datafile!', err)
        })
        .then(() => {
          _compactionQueued = false
        })
    }, 5000)
  }
}

module.exports = Repo
