'use strict'

const { every } = require('lodash')

module.exports = {
  scriptIsNoop(text) {
    return every(text.split('\n'), (line) => !line[0] || line.trim()[0] === '#')
  }
}
