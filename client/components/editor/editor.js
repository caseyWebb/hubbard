'use strict'

const ace = require('brace')
require('brace/mode/nix')
require('brace/theme/github')

const guid = require('../../../lib/guid')('editor')

class Editor {
  constructor({ value }) {
    this.guid = guid()

    requestAnimationFrame(() => {
      this.editor = ace.edit(this.guid)
      this.editor.getSession().setMode('ace/mode/nix')
      this.editor.setTheme('ace/theme/github')
      this.editor.setValue(value())
      this.editor.navigateFileEnd()

      this.editor.on('change', () => {
        value(this.editor.getValue())
      })
    })
  }

  dispose() {
    this.editor.destroy()
  }
}

module.exports = Editor
