'use strict'

const { each } = require('lodash')
const socketio = require('socket.io')
const sockets = []

module.exports = (server) => {
  const io = socketio(server)

  io.on('connection', (socket) => {
    sockets.push(socket)
    socket.on('disconnect', () => sockets.splice(sockets.indexOf(socket), 1))
  })
}

module.exports.emit = (channel, data) => each(sockets, (s) => s.emit(channel, data))
