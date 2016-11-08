'use strict'

const http = require('http')
const path = require('path')
const Koa = require('koa')
const _ = require('lodash')
const program = require('commander')
const mkdirp = require('mkdirp')
const fs = require('fs-promise')
const rimraf = require('rimraf')
const randomstring = require('randomstring')
let logger; const { error, info, verbose } = logger = require('winston')

let config = {}

start()
  .then(() =>
    info(`Hubbard listening on ${config.host}:${config.port}`))
  .catch((err) =>
    error(err))

async function start() {
  const app = new Koa()

  try {
    config = require('./config')
  } catch (e) {
    verbose('No config.js found, creating...')
    await fs.writeFile(path.join(__dirname, './config.js'), '\'use strict\'\n\nmodule.exports = {}')
    config = require('./config')
  }

  _(config)
    .defaults({
      environment: 'production',
      password: '',
      port: 8080,
      host: '0.0.0.0',
      use_https: false,
      log_level: 'info',
      log_format: 'text',
      pid_file: path.resolve(__dirname, '.pid'),
      data_dir: path.resolve(__dirname, './.data'),
      repos_dir: path.resolve(__dirname, './.repos')
    })
    .extendWith({
      environment: process.env.NODE_ENV,
      password: process.env.HUBBARD_PASSWORD,
      port: process.env.HUBBARD_PORT,
      host: process.env.HUBBARD_HOST,
      use_https: process.env.HUBBARD_USE_HTTPS,
      github_access_token: process.env.HUBBARD_GITHUB_ACCESS_TOKEN,
      log_level: process.env.HUBBARD_LOG_LEVEL,
      log_file: process.env.HUBBARD_LOG,
      log_format: process.env.HUBBARD_LOG_FORMAT,
      pid_file: process.env.HUBBARD_PID,
      data_dir: process.env.HUBBARD_DATA,
      repos_dir: process.env.HUBBARD_REPOS
    }, (c, env) => env || c)
    .extendWith({
      password: program.password,
      port: program.port,
      host: program.host,
      use_https: program.useHttps,
      github_access_token: program.accessToken,
      log_file: program.logFile,
      log_level: program.logLevel,
      log_format: program.logFileFormat,
      pid_file: program.pidFile,
      data_dir: program.dataDir,
      repos_dir: program.reposDir,
    }, (c, p) => p || c)
    .value()

  app.keys = [randomstring.generate()]

  if (!config.github_access_token) {
    throw new Error(`
      No GitHub Access Token Supplied:
        Please generate a token at https://github.com/settings/tokens with
        repo and admin:repo_hook permissions, and supply that token in config.js
        as "github_access_token"
    `)
  }

  if (config.pid_file) {
    await fs.writeFile(config.pid_file, process.pid)
    process.on('exit', () => rimraf.sync(config.pid_file))
  }

  logger.level = config.log_level
  const transports = [
    new logger.transports.Console({
      colorize: true
    })
  ]
  if (config.log_file) {
    transports.push(new (logger.transports.File)({
      filename: config.log_file,
      colorize: true,
      json: config.log_format === 'json'
    }))
  }
  logger.configure({ transports })

  const host = config.host
  const port = config.port

  if (config.environment === 'development') {
    config.host = await require('./lib/localtunnel')
    config.port = 80
  }

  verbose('Ensuring .repos directory')
  await mkdirp(path.join(__dirname, '.repos'))

  app.use(require('./api'))
  app.use(require('koa-static')(path.resolve(__dirname, '.dist')))

  const server = http.createServer(app.callback())

  verbose('Connecting to nedb')
  await require('./lib/db')

  await require('./api/models/repo').sync()

  verbose('Starting Hubbard server')
  server.listen(port, host, (err) => {
    if (err) {
      throw new Error(err)
    }
  })
}
