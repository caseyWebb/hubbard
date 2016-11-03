'use strict'

const ko = require('knockout')
const cookie = require('js-cookie')

class App {
  constructor() {
    this.authenticated = ko.observable(cookie.get('authenticated'))
  }
}

module.exports = App
