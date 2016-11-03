'use strict'

const ko = require('knockout')

require('./repo-list.scss')

ko.components.register('repo-list', {
  template: require('./repo-list.html'),
  viewModel: require('./repo-list.js')
})
