'use strict'

const ko = require('knockout')
const socket = require('socket.io-client')()
const guid = require('./guid')()

const _errors = ko.observableArray()

socket.on('api_error', (err) => _errors.push({
  guid: guid.next().value,
  message: err
}))

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
