'use strict'

const api = require('koa-router')({ prefix: '/api' })

api.use(require('koa-bodyparser')())
api.use(require('koa-json')())

api.use(require('./controllers/repos'))
api.use(require('./controllers/test'))

module.exports = api.routes()
