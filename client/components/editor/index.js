'use strict'

const ko = require('knockout')

ko.components.register('editor', {
  template: require('./editor.html'),
  viewModel: require('./editor.js')
})
