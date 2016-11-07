'use strict'

const http = require('http')
const path = require('path')
const Koa = require('koa')
const _ = require('lodash')
const mkdirp = require('mkdirp')
let logger; const { error, info, verbose } = logger = require('winston')

const app = new Koa()
let config = {}

try {
  config = require('./config')
} catch (e) {
  verbose('No config.js found')
  config = {}
}

_(config)
  .defaults({
    environment: 'development',
    password: '',
    port: 8080,
    host: '0.0.0.0',
    use_https: false,
    secret: 'not a good secret',
    log_level: 'info'
  })
  .extendWith({
    environment: process.env.NODE_ENV,
    password: process.env.HUBBARD_PASSWORD,
    port: process.env.HUBBARD_PORT,
    host: process.env.HUBBARD_HOST,
    use_https: process.env.HUBBARD_USE_HTTPS,
    secret: process.env.HUBBARD_SECRET,
    github_access_token: process.env.HUBBARD_GITHUB_ACCESS_TOKEN,
    log_level: process.env.HUBBARD_LOG_LEVEL
  }, (c, env) => env || c)
  .value()

app.keys = [config.secret]

console.log(process.env)

if (!config.github_access_token) {
  error(`
    No GitHub Access Token Supplied:
      Please generate a token at https://github.com/settings/tokens with
      repo and admin:repo_hook permissions, and supply that token in config.js
      as "github_access_token"
  `)

  throw new Error('Missing GitHub Access Token')
}

logger.level = config.log_level
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, { colorize: true })

start()

async function start() {
  const host = config.host
  const port = config.port

  if (config.environment === 'development') {
    app.use(require('./lib/webpack-dev-middleware'))
    config.host = await require('./lib/localtunnel')
    config.port = 80
  }

  verbose('Ensuring .repos directory')
  await mkdirp(path.join(__dirname, '.repos'))

  app.use(require('./api'))
  app.use(require('koa-static')(path.resolve(__dirname, 'public')))

  const server = http.createServer(app.callback())

  verbose('Connecting to nedb')
  await require('./lib/db')

  await require('./api/models/repo').sync()

  verbose('Starting Hubbard server')
  server.listen(port, host, (err) => {
    if (err) {
      throw new Error(err)
    } else {
      info(`Hubbard listening on ${config.host}:${config.port}`)
    }
  })
}
