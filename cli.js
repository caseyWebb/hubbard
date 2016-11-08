#!/usr/bin/env node --harmony

'use strict'

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs-promise')
const rimraf = require('rimraf')
const program = require('commander')
const { error } = require('winston')

program
  .version(require('./package.json').version)
  .usage('[command]')
  .option('-h, --host [host]',              'Hostname to bind server and webhooks')
  .option('-p, --port [port]',              'Port to bind server and webhooks [8080]')
  .option('-s, --use-https',                'Use HTTPS')
  .option('-t, --access-token [token]',     'GitHub personal access token')
  .option('--pass, --password [password]',  'Login password')
  .option('--data, --data-dir [directory]',  'Directory to store nedb data in')
  .option('--repos, --repos-dir [directory]','Directory to store repositories in')
  .option('-l, --log-file [file]',          'File to write logs to')
  .option('-ll, --log-level [level]',       'Logfile verbosity [err, info, verbose]', 'info')
  .option('-lf, --log-file-format [format]','Format to log to logfile [text, json]', 'json')
  .option('-pf, --pid-file [file]',         'File to output process id to')

program
  .command('start')
  .description('Start Hubbard server as a daemon')
  .action(() => {
    const env = process.env

    if (program.host) env.HUBBARD_HOST = program.host
    if (program.port) env.HUBBARD_PORT = program.port
    if (program.password) env.HUBBARD_PASSWORD = program.password
    if (program.useHttps) env.HUBBARD_USE_HTTPS = program.useHttps
    if (program.accessToken) env.HUBBARD_GITHUB_ACCESS_TOKEN = program.accessToken
    if (program.logLevel) env.HUBBARD_LOG_LEVEL = program.logLevel
    if (program.logFile) env.HUBBARD_LOG = program.logFile
    if (program.logFileFormat) env.HUBBARD_LOG_FORMAT = program.logFileFormat
    if (program.dataDir) env.HUBBARD_DATA = program.dataDir
    if (program.reposDir) env.HUBBARD_REPOS = program.reposDir
    if (program.pidFile) env.HUBBARD_PID = program.pidFile

    spawn('node', ['--harmony', path.resolve(__dirname, './index.js')], { detached: true, env, stdio: 'ignore' }).unref()
  })

program
  .command('stop')
  .description('Stop running Hubbard server')
  .action(async () => {
    let pidFile
    if (program.pidFile) {
      pidFile = program.pidFile
    } else if (process.env.HUBBARD_PID) {
      pidFile = process.env.HUBBARD_PID
    } else {
      try {
        pidFile = require('./config').pidFile
      } catch (e) {} // eslint-disable-line no-empty
    }
    if (!pidFile) {
      pidFile = '.pid'
    }
    let pid
    try {
      pid = await fs.readFile(pidFile, 'utf8')
    } catch (e) {
      error('No running instance found')
    }
    try {
      process.kill(pid)
    } catch (e) {
      error('Failed to kill process', pid, e)
    } finally {
      await rimraf(pidFile)
    }
  })

program.parse(process.argv)

if (program.args.length === 0) {
  require('./index')
}
