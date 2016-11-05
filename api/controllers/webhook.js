'use strict'

const router = require('koa-router')
const Repos = require('../models/repo')

module.exports = router({ prefix: '/webhook' })
  .post('/', async (ctx) => {
    const repo = await Repos.findOne({ _id: ctx.request.body.id })
    await repo.deploy()
    ctx.status = 200
  })

  .routes()
