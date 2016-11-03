'use strict'

const path = require('path')
const { connect } = require('camo')

module.exports = connect(`nedb:///${path.resolve(__dirname, '../.data')}`)
