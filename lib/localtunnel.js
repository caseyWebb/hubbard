'use strict'

const url = require('url')
const localtunnel = require('localtunnel')
const { verbose } = require('winston')
const config = require('../config')

module.exports = new Promise((resolve, reject) => {
  verbose('Setting up localtunnel proxy')
  localtunnel(config.port, (err, { url: _url })  => {
    if (err) {
      reject(err)
    } else {
      verbose(`localtunnel proxy set up on ${_url}`)
      resolve(url.parse(_url).hostname)
    }
  })
})
