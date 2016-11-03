'use strict'

const ko = require('knockout')

require('./switch.scss')

ko.components.register('switch', {
  template: require('./switch.html'),
  viewModel: require('./switch.js')
})
