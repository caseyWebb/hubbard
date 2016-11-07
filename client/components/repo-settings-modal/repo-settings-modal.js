'use strict'

const $ = require('jquery')
const ko = require('knockout')

class RepoSettingModal {
  constructor({ repo, visible }) {
    this.repo = repo
    this.guid = `repo-settings-modal-${this.repo.owner()}-${this.repo.name().replace(/\./g, '-')}`
    this.showErrors = ko.observable(false)

    if (!this.repo.start_script.valid()) {
      visible(true)
    }

    requestAnimationFrame(() => {
      this.$modal = $(`#${this.guid}`)

      this.sub = visible.subscribe((v) =>
          this.$modal.modal(v
            ? 'show'
            : 'hide'))

      this.$modal.on('hidden.bs.modal', () => {
        visible(false)
        if (!this.repo.start_script.valid()) {
          this.repo.enabled(false)
        }
      })
    })
  }

  save(data, e) {
    if (!this.repo.start_script.valid()) {
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
