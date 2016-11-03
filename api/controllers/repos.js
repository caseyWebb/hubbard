'use strict'

const { extend } = require('lodash')
const router = require('koa-router')
const authenticate = require('../middleware/authenticate')
const Repos = require('../models/repo')

module.exports = router({ prefix: '/repos' })
  .get('/', authenticate, function * (next) {
    this.body = yield Repos.find({}, { sort: ['-enabled', 'name'] })
    yield next
  })

  .patch('/:id', authenticate, function * (next) {
    const repo = yield Repos.findOne({ _id: this.params.id })
    extend(repo, this.request.body)
    this.body = yield repo.save()
    yield next
  })

  .get('/sync', authenticate, function * (next) {
    this.body = yield Repos.sync()
    yield next
  })

  .routes()
