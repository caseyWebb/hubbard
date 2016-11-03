'use strict'

const config = require('../config')

module.exports = require('axios').create({
  baseURL: 'https://api.github.com/',
  headers: {
    Authorization: `token ${config.github_access_token}`
  }
})
