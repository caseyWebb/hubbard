'use strict'

const ko = require('knockout')
const guid = require('./guid')()

const _errors = ko.observableArray()

module.exports = ko.pureComputed({
  read() {
    return _errors()
  },
  write(err) {
    _errors.push({
      guid: guid.next().value,
      message: err
    })
  }
})

module.exports.clear = () => _errors([])
module.exports.remove = (err) => _errors.remove(err)
