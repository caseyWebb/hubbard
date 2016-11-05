'use strict'

const { extend } = require('lodash')
const router = require('koa-router')
const authenticate = require('../middleware/authenticate')
const Repos = require('../models/repo')
const SSEStream = require('../../lib/sse-stream')

module.exports = router({ prefix: '/repos' })
  .get('/', authenticate, async (ctx) => {
    ctx.body = await Repos.find({}, { sort: ['-enabled', 'name'] })
  })

  .get('/sync', authenticate, async (ctx) => {
    ctx.body = await Repos.sync()
  })

  .patch('/:name', authenticate, async (ctx) => {
    const repo = await Repos.findOne({ _id: ctx.params.name })
    extend(repo, ctx.request.body)
    ctx.body = await repo.save()
  })

  .get('/:name/log', authenticate, async (ctx) => {
    const repo = await Repos.findOne({ name: ctx.params.name })

    this.body = repo.log.pipe(new SSEStream('log_data'))

    ctx.req.on('close', () => ctx.res.end())
    ctx.req.on('finish', () => ctx.res.end())
    ctx.req.on('error', () => ctx.res.end())
  })

  .routes()
