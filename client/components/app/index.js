'use strict'

const ko = require('knockout')

ko.components.register('app', {
  template: require('./app.html'),
  viewModel: require('./app.js')
})
