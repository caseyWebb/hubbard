'use strict'

const { Transform } = require('stream')

class SSEStream extends Transform {
  constructor(options) {
    super(options)
    this.event = options.event
  }

  _transform(data, enc, done) {
    this.push(`event:${this.event}\ndata: ${data}\n\n`)
    done()
  }
}

module.exports = SSEStream
