'use strict'

const ko = require('knockout')

require('./loader.scss')

ko.components.register('loader', {
  template: require('./loader.html')
})
