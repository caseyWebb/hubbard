'use strict'

const { isMatchWith } = require('lodash')
const ko = require('knockout')

ko.extenders.queryable = (arr, comparator) => {
  arr.extend({ _: true })
  arr.query = (q) => arr._.filter((el) => isMatchWith(ko.toJS(el), ko.toJS(q), comparator))
  return arr
}
