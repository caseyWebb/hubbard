'use strict'

const ko = require('knockout')
const socket = require('socket.io-client')()

class RepoListItem {
  constructor({ repo }) {
    this.repo = repo
    this.cloning = ko.observable(false)
    this.showSettings = ko.observable(false)

    this.sub = this.repo.enabled.subscribe((v) => {
      if (!v || this.repo.run_script.valid()) {
        this.repo.save()
      }
    })

    socket.on(`repo_clone_started.${this.repo._id()}`, () => this.cloning(true))
    socket.on(`repo_clone_success.${this.repo._id()}`, () => this.cloning(false))
    socket.on(`repo_clone_failed.${this.repo._id()}`, () => this.cloning(false))
  }

  dispose() {
    this.sub.dispose()
  }
}

module.exports = RepoListItem
