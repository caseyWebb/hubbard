'use strict'

const url = require('url')
const localtunnel = require('localtunnel')
const config = require('../config')

module.exports = new Promise((resolve, reject) => {
  localtunnel(config.port, (err, { url: _url })  =>
      err ? reject(err) : resolve(url.parse(_url).hostname))
})
