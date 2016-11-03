'use strict'

const ko = require('knockout')

ko.extenders.cast = (arr, Class) => {
  arr.extend({ _: true })
  return ko.pureComputed({
    read() { return arr._.map((el) => new Class(el))() },
    write(v) { arr(v) }
  })
}
