'use strict'

module.exports = function * (next) {
  if (this.cookies.get('authenticated')) {
    yield next
  } else {
    this.status = 401
  }
}
