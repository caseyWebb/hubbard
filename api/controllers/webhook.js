'use strict'

const router = require('koa-router')
const { info } = require('winston')
const gh = require('../../lib/github-api')
const Repos = require('../models/repo')
const authenticate = require('../middleware/authenticate')

module.exports = router({ prefix: '/webhook' })
  .get('/test/:name', authenticate, async (ctx) => {
    const repo = await Repos.findOne({ name: ctx.params.name })
    await gh.post(`/repos/${repo.owner}/${repo.name}/hooks/${repo.webhook_id}/tests`)
    ctx.status = 200
    ctx.body = true
  })

  .post('/', async (ctx) => {
    const repo = await Repos.findOne({ _id: ctx.request.body.repository.id.toString() })
    info('Webhook recieved for', repo.name)
    await repo.deploy()
    ctx.status = 200
  })

  .routes()
