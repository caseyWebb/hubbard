'use strict'

const { invokeMap } = require('lodash')
const ko = require('knockout')

class RepoListItem {
  constructor({ repo }) {
    this.repo = repo
    this.cloning = ko.observable(false)
    this.showSettings = ko.observable(false)
    this.showLog = ko.observable(false)

    this.subs = [
      this.repo.enabled.subscribe((v) => {
        if (v) {
          if (this.repo.start_script.valid()) {
            this.showLog(true)
          } else {
            this.showSettings(true)
          }
        }
        if (!v || this.repo.start_script.valid()) {
          this.repo.save()
        }
      }),
      this.showSettings.subscribe((v) => {
        if (!v && this.repo.enabled()) {
          this.showLog(true)
        }
      })
    ]
  }

  dispose() {
    invokeMap(this.subs, 'dispose')
  }
}

module.exports = RepoListItem
