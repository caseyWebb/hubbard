'use strict'

const { extend, noop } = require('lodash')
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
    ctx.socket.setTimeout(Number.MAX_VALUE)
    ctx.type = 'text/event-stream'
    ctx.set('Cache-Control', 'no-cache')
    ctx.set('Connection', 'keep-alive')

    ctx.body = repo.log.pipe(new SSEStream('log_data'))

    return new Promise((resolve) => {
      ctx.req.on('close', close)
      ctx.req.on('finish', close)
      ctx.req.on('error', close)
      
      function close() {
        ctx.res.end()
        resolve()
      }
    })
  })

  .routes()
