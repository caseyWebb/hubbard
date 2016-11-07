'use strict'

const $ = require('jquery')
const ko = require('knockout')
const ansi = require('ansi_up')

class RepoLogModal {
  constructor({ repo, visible }) {
    this.es = new EventSource(`/api/repos/${repo.name()}/log`)
    this.log = ko.observable('')

    this.es.addEventListener('log_data', ({ data }) => {
      this.log(this.log() + ansi.ansi_to_html(JSON.parse(data).output))
      const el = document.getElementById('log-output')
      el.scrollTop = el.scrollHeight
    })

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
