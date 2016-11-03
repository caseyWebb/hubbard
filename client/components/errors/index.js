'use strict'

const ko = require('knockout')

require('./errors.scss')

ko.components.register('errors', {
  template: require('./errors.html'),
  viewModel: require('./errors.js')
})
