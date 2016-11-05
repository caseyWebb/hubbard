'use strict'

const ko = window.ko = require('knockout')

ko.options.deferUpdates = true

require('ko-projections')
require('knockout-punches')
ko.punches.enableAll()
require('../lib/ko-extender-cast')
require('../lib/ko-extender-queryable')

require('./index.scss')

require('./components/app')
require('./components/editor')
require('./components/errors')
require('./components/loader')
require('./components/login')
require('./components/repo-list')
require('./components/repo-list-item')
require('./components/repo-settings-modal')
require('./components/switch')
require('./components/sync-button')

$(() => ko.applyBindings())
