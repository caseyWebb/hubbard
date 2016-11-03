'use strict'

const ko = require('knockout')

ko.components.register('repo-list-item', {
  template: require('./repo-list-item.html'),
  viewModel: require('./repo-list-item.js')
})
