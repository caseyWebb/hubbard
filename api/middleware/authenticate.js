'use strict'

module.exports = async (ctx, next) => {
  if (ctx.cookies.get('authenticated')) {
    await next()
  } else {
    ctx.status = 401
  }
}
