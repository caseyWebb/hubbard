'use strict'

const $ = require('jquery')
const ko = require('knockout')

class RepoSettingModal {
  constructor({ repo, visible }) {
    this.repo = repo
    this.guid = `repo-settings-modal-${this.repo.owner()}-${this.repo.name().replace(/\./g, '-')}`
    this.showErrors = ko.observable(false)

    if (!this.repo.script.valid()) {
      visible(true)
    }

    requestAnimationFrame(() => {
      this.$modal = $(`#${this.guid}`)

      this.sub = ko.computed(() =>
          this.$modal.modal(visible()
            ? 'show'
            : 'hide'))

      this.$modal.on('hidden.bs.modal', () => {
        if (!this.repo.script.valid()) {
          this.repo.enabled(false)
        }
      })
    })
  }

  save(data, e) {
    if (!this.repo.script.valid()) {
      this.showErrors(true)
      e.preventDefault()
    } else {
      this.repo
        .save()
        .then(() => {
          this.$modal.modal('hide')
        })
    }
  }

  dispose() {
    this.sub.dispose()
    this.$modal.off('hidden.bs.modal')
  }
}

module.exports = RepoSettingModal
