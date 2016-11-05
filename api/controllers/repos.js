'use strict'

const { extend } = require('lodash')
const router = require('koa-router')
const authenticate = require('../middleware/authenticate')
const Repos = require('../models/repo')

module.exports = router({ prefix: '/repos' })
  .get('/', authenticate, async (ctx) => {
    ctx.body = await Repos.find({}, { sort: ['-enabled', 'name'] })
  })

  .patch('/:id', authenticate, async (ctx) => {
    const repo = await Repos.findOne({ _id: ctx.params.id })
    extend(repo, ctx.request.body)
    ctx.body = await repo.save()
  })

  .get('/sync', authenticate, async (ctx) => {
    ctx.body = await Repos.sync()
  })

  .routes()
