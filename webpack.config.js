'use strict'

const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let environment = process.env.NODE_ENV
if (!environment) {
  let c
  try {
    c = require('./config')
  } catch(e) {
    c = {}
  }
  environment = c.environment || 'production'
  process.env.NODE_ENV = environment
}

const config = {
  entry: './client/index.js',

  output: {
    path: './.dist',
    filename: 'app.js',
    publicPath: '/'
  },

  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html'
      },

      {
        test: /\.css$/,
        loader: 'style!css'
      },

      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      },

      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url?limit=10000&minetype=application/font-woff'
      },

      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file'
      }
    ]
  },

  externals: {
    'jquery': 'jQuery'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.ejs',
      hash: true
    })
  ]
}

if (environment !== 'development') {
  config.module.loaders.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    loader: 'babel',
    query: {
      cacheDirectory: true,
      presets: ['es2015']
    }
  })
}

if (environment === 'development') {
  config.devtool = 'source-map'
}

if (environment === 'production') {
  config.plugins.push(new CompressionPlugin())
  config.plugins.push(new webpack.optimize.UglifyJsPlugin())
}

module.exports = config
