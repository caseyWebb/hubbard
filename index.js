'use strict'

const http = require('http')
const path = require('path')
const co = require('co')
const { defaults } = require('lodash')
const serve = require('koa-static')
const socketio = require('socket.io')
const PubSub = require('pubsub-js')
const config = require('./config')

const app = require('koa')()

defaults(config, {
  environment: 'development',
  port: 8080,
  host: '0.0.0.0',
  use_https: false
})

if (!config.github_access_token) {
  console.error(`
    No GitHub Access Token Supplied:
      Please generate a token at https://github.com/settings/tokens with
      repo and admin:repo_hook permissions, and supply that token in config.js
      as "github_access_token"
  `)

  throw new Error('Missing GitHub Access Token')
}

co(function * () {
  const host = config.host
  const port = config.port

  if (config.environment === 'development') {
    app.use(require('./lib/webpack-dev-middleware'))
    config.host = yield require('./lib/localtunnel')
    config.port = 80
  }

  app.use(require('./api'))
  app.use(serve(path.resolve(__dirname, 'public')))

  const server = http.createServer(app.callback())
  const io = socketio(server)

  yield require('./lib/db')
  yield require('./api/models/repo').sync()

  server.listen(port, host, (err) => {
    if (err) {
      throw new Error(err)
    } else {
      console.log(`Hubbard listening on port ${config.host}:${config.port}`)
    }
  })

  io.on('connection', (socket) => {
    const handler = (msg, data) => socket.emit('api.error', data)
    PubSub.subscribe('api.error', handler)
    socket.on('disconnect', () => PubSub.unsubscribe(handler))
  })
})