'use strict'

const { every } = require('lodash')
const ko = require('knockout')
const axios = require('axios')
const { merge } = require('ko-contrib-utils')
const error = require('../../lib/errors')

class Repo {
  constructor(r) {
    merge(this, r)
    this.script.valid = ko.pureComputed(() => !_isOnlyComments(this.script()))
  }

  save() {
    return axios
      .patch(`/api/repos/${this._id()}`, ko.toJS(this), { timeout: 0 })
      .catch((err) => error(err))
  }
}

function _isOnlyComments(text) {
  return every(text.split('\n'), (line) => !line[0] || line.trim()[0] === '#')
}

module.exports = Repo
