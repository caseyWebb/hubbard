'use strict'

const { isMatch } = require('lodash')
const ko = require('knockout')

ko.extenders.queryable = (arr) => {
  arr.extend({ _: true })
  arr.query = (q) => arr._.filter((el) => isMatch(ko.toJS(el), ko.toJS(q)))
  return arr
}
