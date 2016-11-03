'use strict'

const ko = require('knockout')

ko.components.register('repo-settings-modal', {
  template: require('./repo-settings-modal.html'),
  viewModel: require('./repo-settings-modal.js')
})
