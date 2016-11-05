'use strict'

const http = require('http')
const path = require('path')
const co = require('co')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const config = require('./config')

const app = require('koa')()

_(config)
  .defaults({
    environment: 'development',
    password: '',
    port: 8080,
    host: '0.0.0.0',
    use_https: false,
    secret: 'not a good secret'
  })
  .extendWith({
    environment: process.env.NODE_ENV,
    password: process.env.HUBBARD_PASSWORD,
    port: process.env.HUBBARD_PORT,
    host: process.env.HUBBARD_HOST,
    use_https: process.env.HUBBARD_USE_HTTPS,
    secret: process.env.HUBBARD_SECRET,
    github_access_token: process.env.HUBBARD_GITHUB_ACCESS_TOKEN
  }, (c, env) => env || c)
  .value()

app.keys = [config.secret]

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

  yield mkdirp(path.join(__dirname, '.repos'))

  app.use(require('./api'))
  app.use(require('koa-static')(path.resolve(__dirname, 'public')))

  const server = http.createServer(app.callback())

  yield require('./lib/db')
  yield require('./api/models/repo').sync()

  server.listen(port, host, (err) => {
    if (err) {
      throw new Error(err)
    } else {
      console.log(`Hubbard listening on ${config.host}:${config.port}`)
    }
  })
})
