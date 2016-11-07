'use strict'

const { Transform } = require('stream')

class SSEStream extends Transform {
  constructor(name) {
    super()
    this.name = name
  }

  _transform(data, enc, done) {
    this.push(`event: ${this.name}\ndata: ${JSON.stringify({ output: data.toString() })}\n\n`)
    done()
  }
}

module.exports = SSEStream
