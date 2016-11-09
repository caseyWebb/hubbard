'use strict'

const { connect } = require('camo')
const program = require('commander')

module.exports = connect(`nedb:///${program.dataDir}`)
