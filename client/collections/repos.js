'use strict'

const { includes, isUndefined } = require('lodash')
const ko = require('knockout')
const axios = require('axios')
const Repo = require('../models/repo')
const errors = require('../../lib/errors')

const _loaded = ko.observable(false)
const _syncing = ko.observable(false)
const _repos = ko.observableArray([]).extend({
  queryable: (repo, query, key) => {
    if (key === 'name') {
      return isUndefined(query) || includes(repo.toLowerCase(), query.toLowerCase())
    }
  }
})

class Repos {
  static get loaded() {
    return _loaded
  }

  static get syncing() {
    return _syncing
  }

  static find(q = {}) {
    if (!_loaded()) {
      Repos.load()
    }

    return _repos.query(q).extend({ cast: Repo })
  }

  static load() {
    return axios
      .get('/api/repos')
      .then(({ data: repos }) => {
        _repos(repos)
        _loaded(true)
        return _repos()
      })
  }

  static sync() {
    _syncing(true)

    return axios
      .get('/api/repos/sync')
      .then(({ data: updatedRepos }) => {
        _repos(updatedRepos)
        _syncing(false)
        return _repos()
      })
      .catch((err) => {
        _syncing(false)
        errors.push(err)
      })
  }
}

module.exports = Repos
