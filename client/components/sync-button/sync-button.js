'use strict'

const Repos = require('../../collections/repos')

class SyncButton {
  constructor() {
    this.syncing = Repos.syncing
  }

  sync() {
    Repos.sync()
  }
}

module.exports = SyncButton
