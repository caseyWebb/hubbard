'use strict'

const router = require('koa-router')
const config = require('../../config')

module.exports = router({ prefix: '/auth' })
  .post('/login', function * () {
    if (this.request.body.password === config.password) {
      this.cookies.set('authenticated', true, { signed: true, httpOnly: false })
      this.status = 200
    } else {
      this.status = 401
      this.body = 'Incorrect Password'
    }
  })

  .get('/logout', function * () {
    this.cookies.set('authenticated', false, { signed: true, httpOny: false })
    this.redirect('/')
  })

  .routes()
