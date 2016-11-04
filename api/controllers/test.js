'use strict'

const router = require('koa-router')
const io = require('../../lib/io')

module.exports = router({ prefix: '/test' })
  .get('/error', function * () {
    io.emit('api_error', 'This is only a test')
    this.body = ''
  })

  .routes()
