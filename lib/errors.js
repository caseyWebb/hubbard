'use strict'

const ko = require('knockout')
const io = require('socket.io-client')
const guid = require('./guid')()

const socket = io()

const _errors = ko.observableArray()

socket.on('api.error', (err) => _errors.push({
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
