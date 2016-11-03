'use strict'

module.exports = function * (namespace) {
  let count = 0
  while (true) { // eslint-disable-line no-constant-condition
    yield (namespace ? namespace + '-' : '') + count++
  }
}
