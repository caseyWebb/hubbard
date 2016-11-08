'use strict'

const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  entry: './client/index.js',

  output: {
    path: 'public/dist',
    filename: 'bundle.js',
    publicPath: '/dist/'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: ['es2015']
        }
      },

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

  devtool: 'source-map',

  plugins: [
    new CompressionPlugin()
  ]
}
