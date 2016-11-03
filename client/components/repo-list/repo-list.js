'use strict'

const Repos = require('../../collections/repos')

class RepoList {
  constructor() {
    this.loaded = Repos.loaded
    this.syncing = Repos.syncing
    this.repos = Repos.find()
  }
}

module.exports = RepoList
