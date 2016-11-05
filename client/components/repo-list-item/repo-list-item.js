'use strict'

const ko = require('knockout')

class RepoListItem {
  constructor({ repo }) {
    this.repo = repo
    this.cloning = ko.observable(false)
    this.showSettings = ko.observable(false)

    this.sub = this.repo.enabled.subscribe((v) => {
      if (!v || this.repo.start_script.valid()) {
        this.repo.save()
      }
    })
  }

  dispose() {
    this.sub.dispose()
  }
}

module.exports = RepoListItem
