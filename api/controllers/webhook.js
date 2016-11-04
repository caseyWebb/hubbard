'use strict'

const router = require('koa-router')
const Repos = require('../models/repo')

module.exports = router({ prefix: '/webhook' })
  .post('/', function * (next) {
    yield Repos.deploy(this.request.body.id)
    this.status = 200
    yield next
  })

  .routes()
