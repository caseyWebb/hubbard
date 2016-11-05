'use strict'

const { merge } = require('lodash')
const middleware = require('koa-webpack')
const config = require('../webpack.config')

merge(config, { output: { path: config.output.publicPath } })

module.exports = middleware({
  config,
  dev: {
    publicPath: '/dist/',
    noInfo: true
  }
})
