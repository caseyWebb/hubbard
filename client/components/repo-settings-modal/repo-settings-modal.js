'use strict'

const $ = require('jquery')
const ko = require('knockout')
const error = require('../../../lib/errors')

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
      this.$modal.modal('show')
      this.$modal.on('hidden.bs.modal', () => {
        if (!this.repo.start_script.valid()) {
          this.repo.enabled(false)
        }
        visible(false)
      })
    })
  }

  save(data, e) {
    if (!this.repo.start_script.valid()) {
      this.showErrors(true)
      e.preventDefault()
    } else {
      this.$modal.modal('hide')
      this.repo
        .save()
        .catch((err) => error(err))
    }
  }
}

module.exports = RepoSettingModal
