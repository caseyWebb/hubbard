'use strict'

const { merge } = require('lodash')
const webpack = require('webpack')
const webpackDevMiddleware = require('koa-webpack-dev-middleware')
const webpackConfig = require('../webpack.config')

const webpackCompiler = webpack(merge(
  webpackConfig,
  { output: { path: webpackConfig.output.publicPath } })
)

module.exports = webpackDevMiddleware(webpackCompiler, {
  publicPath: '/dist/',
  noInfo: true
})
