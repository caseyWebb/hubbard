'use strict'

const ko = require('knockout')
const axios = require('axios')
const errors = require('../../../lib/errors')

class Login {
  constructor({ authenticated }) {
    this.authenticated = authenticated
    this.loading = ko.observable(false)
    this.password = ko.observable('')
  }

  login() {
    this.loading(true)

    axios
      .post('/api/auth/login', { password: this.password() })
      .then(() => this.authenticated(true))
      .catch((err) => {
        errors(err.response.data)
        err = errors()[errors().length - 1]
        setTimeout(() => errors.remove(err), 2000)
      })
      .then(() => this.loading(false))
  }
}

module.exports = Login
