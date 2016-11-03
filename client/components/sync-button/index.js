'use strict'

const ko = require('knockout')

ko.components.register('sync-button', {
  template: require('./sync-button.html'),
  viewModel: require('./sync-button.js')
})
