'use strict'

const ko = require('knockout')
const axios = require('axios')
const { merge } = require('ko-contrib-utils')
const error = require('../../lib/errors')
const { scriptIsNoop } = require('../../lib/utils')

class Repo {
  constructor(r) {
    merge(this, r)
    this.start_script.valid = ko.pureComputed(() => !scriptIsNoop(this.start_script()))
  }

  save() {
    return axios
      .patch(`/api/repos/${this._id()}`, ko.toJS(this), { timeout: 0 })
      .catch((err) => error(err))
  }
}

module.exports = Repo
