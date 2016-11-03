'use strict'

const guid = require('../../../lib/guid')('switch')

class Switch {
  constructor({ checked }) {
    this.guid = guid.next().value
    this.checked = checked
  }
}

module.exports = Switch
