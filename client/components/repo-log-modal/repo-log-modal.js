'use strict'

const $ = require('jquery')
const ko = require('knockout')

class RepoLogModal {
  constructor({ repo, visible }) {
    this.es = new EventSource(`/api/repos/${repo.name()}/log`)
    this.log = ko.observable('')

    this.es.addEventListener('log_data', ({ data }) =>
      this.log(this.log() + JSON.parse(data).output))

    this.repo = repo
    this.guid = `repo-log-modal-${this.repo.owner()}-${this.repo.name().replace(/\./g, '-')}`


    requestAnimationFrame(() => {
      this.$modal = $(`#${this.guid}`)
      this.$modal.modal('show')
      this.$modal.on('hidden.bs.modal', () => visible(false))
    })
  }

  dispose() {
    this.es.close()
  }
}

module.exports = RepoLogModal
