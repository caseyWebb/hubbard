'use strict'

const program = require('commander')

module.exports = require('axios').create({
  baseURL: 'https://api.github.com/',
  headers: {
    Authorization: `token ${program.accessToken}`
  }
})
