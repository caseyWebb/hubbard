'use strict'

const { extend } = require('lodash')
const router = require('koa-router')
const Repos = require('../models/repo')

module.exports = router({ prefix: '/repos' })
  .get('/', function * () {
    this.body = yield Repos.find({}, { sort: ['-enabled', 'name'] })
  })

  .patch('/:id', function * () {
    const repo = yield Repos.findOne({ _id: this.params.id })
    extend(repo, this.request.body)
    this.body = yield repo.save()
  })

  .get('/sync', function * () {
    this.body = yield Repos.sync()
  })

  .routes()
