'use strict'

const ko = require('knockout')

require('./repo-log-modal.scss')

ko.components.register('repo-log-modal', {
  template: require('./repo-log-modal.html'),
  viewModel: require('./repo-log-modal.js')
})
