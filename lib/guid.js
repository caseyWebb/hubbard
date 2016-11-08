'use strict'

module.exports = function(namespace) {
  let count = 0
  return () => (namespace ? namespace + '-' : '') + count++
}
