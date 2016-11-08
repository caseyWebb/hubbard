'use strict'

const router = require('koa-router')
const config = require('../../config')

module.exports = router({ prefix: '/auth' })
  .post('/login', (ctx) => {
    if (ctx.request.body.password === config.password) {
      ctx.cookies.set('authenticated', true, { signed: true, httpOnly: false })
      ctx.status = 200
      ctx.body = 'Login Successful'
    } else {
      ctx.status = 401
      ctx.body = 'Incorrect Password'
    }
  })

  .get('/logout', (ctx) => {
    ctx.cookies.set('authenticated', false, { signed: true, httpOny: false })
    ctx.redirect('/')
  })

  .routes()
