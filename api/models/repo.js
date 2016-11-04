'use strict'

let _; const { extend } = _ = require('lodash')
const co = require('co')
const { Document, getClient } = require('camo')
const config = require('../../config')
const _db = require('../../lib/db')
const io = require('../../lib/io')
const gh = require('../../lib/github-api')

let _compactionQueued

class Repo extends Document {
  static collectionName() {
    return 'repos'
  }

  constructor() {
    super()

    this._id = String
    this.owner = String
    this.name = String
    this.url = String
    this.enabled = {
      type: Boolean,
      default: false
    }
    this.build_script = {
      type: String,
      default: '#!/bin/bash\n\n'
    }
    this.test_script = {
      type: String,
      default: '#!/bin/bash\n\n'
    }
    this.run_script = {
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
            url: `http${config.use_https ? 's' : ''}://${config.host}:${config.port}/api/repos/webhook`,
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
              throw new Error(err)
            }
          })
        yield getClient()._collections.repos.update({ _id: this._id }, { $unset: { webhook_id: true } })
      }
    }.bind(this))
    .catch((err) => {
      io.emit('api.error', err.message)
      console.error('Error deleting repo webhook:', err.message)
    })
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
