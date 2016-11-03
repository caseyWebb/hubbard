'use strict'

const router = require('koa-router')
const PubSub = require('pubsub-js')

module.exports = router({ prefix: '/test' })
  .get('/error', function * () {
    PubSub.publish('api.error', 'This is only a test')
    this.body = ''
  })

  .routes()
