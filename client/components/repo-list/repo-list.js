'use strict'

const ko = require('knockout')
const Repos = require('../../collections/repos')

class RepoList {
  constructor() {
    this.search = ko.observable()
    this.loaded = Repos.loaded
    this.syncing = Repos.syncing
    this.repos = Repos.find({ name: this.search })
  }
}

module.exports = RepoList
