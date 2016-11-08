'use strict'

const guid = require('../../../lib/guid')('switch')

class Switch {
  constructor({ checked }) {
    this.guid = guid()
    this.checked = checked
  }
}

module.exports = Switch
