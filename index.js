#!/usr/bin/env node --harmony
'use strict'

const http = require('http')
const path = require('path')
const Koa = require('koa')
const { defaults, extendWith } = require('lodash')
const program = require('commander')
const mkdirp = require('mkdirp')
const fs = require('fs-promise')
const rimraf = require('rimraf')
const randomstring = require('randomstring')
let logger; const { error, info, verbose } = logger = require('winston')

start()
  .then(() =>
    info(`Hubbard listening on ${program.host}:${program.port}`))
  .catch((err) =>
    error(err))

async function start() {
  const app = new Koa()

  let config
  if (!program.config) {
    try {
      config = require('./config')
    } catch (e) {
      config = {}
    }
  }

  defaults(program, extendWith(
    {
      environment: 'production',
      password: '',
      port: 8080,
      host: '0.0.0.0',
      useHttps: false,
      logLevel: 'info',
      logFormat: 'text',
      pidFile: path.resolve(__dirname, '.pid'),
      dataDir: path.resolve(__dirname, './.data'),
      reposDir: path.resolve(__dirname, './.repos')
    },
    {
      environment: process.env.NODE_ENV,
      password: process.env.HUBBARD_PASSWORD,
      port: process.env.HUBBARD_PORT,
      host: process.env.HUBBARD_HOST,
      useHttps: process.env.HUBBARD_USE_HTTPS,
      accessToken: process.env.HUBBARD_GITHUB_ACCESS_TOKEN,
      logLevel: process.env.HUBBARD_LOG_LEVEL,
      logFile: process.env.HUBBARD_LOG,
      logFormat: process.env.HUBBARD_LOG_FORMAT,
      pidFile: process.env.HUBBARD_PID,
      dataDir: process.env.HUBBARD_DATA,
      reposDir: process.env.HUBBARD_REPOS,
    },
    process.env.__daemon ? {} : config,
    (c, p) => p || c))

  app.keys = [randomstring.generate()]

  if (!program.accessToken) {
    throw new Error('No GitHub Access Token Supplied')
  }

  if (program.pidFile) {
    await fs.writeFile(program.pidFile, process.pid)
    process.on('exit', () => rimraf.sync(program.pidFile))
  }

  logger.level = program.logLevel
  const transports = [
    new logger.transports.Console({
      colorize: true
    })
  ]
  if (program.logFile) {
    transports.push(new (logger.transports.File)({
      filename: program.logFile,
      colorize: true,
      json: program.logFormat === 'json'
    }))
  }
  logger.configure({ transports })

  const host = program.host
  const port = program.port

  if (program.environment === 'development') {
    program.host = await require('./lib/localtunnel')
    program.port = 80
  }

  verbose('Ensuring repo directory')
  await mkdirp(program.reposDir)

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
