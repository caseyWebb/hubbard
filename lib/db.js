'use strict'

const { connect } = require('camo')
const config = require('../config')

module.exports = connect(`nedb:///${config.data_dir}`)
