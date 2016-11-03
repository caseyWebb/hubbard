'use strict'

const ko = require('knockout')

ko.components.register('login', {
  template: require('./login.html'),
  viewModel: require('./login.js')
})
