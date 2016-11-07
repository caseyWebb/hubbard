# Hubbard

GitHub Deployments, Simplified.

#### What it does
- Registers GitHub webhooks for enabled repositories
- Pulls the latest version after a push
- Runs user-defined setup/teardown scripts

#### What it doesn't do
- Attempt to figure out the deployment strategy (npm start, docker start, etc.)
- Restart the process if it dies

Hubbard is essentially a glorified git post-checkout hook with GitHub mojo. That's it.

#### Screenshots
![](https://www.dropbox.com/s/v0lr6f21ocq0rur/Screenshot%202016-11-07%2018.19.07.png?dl=0)
![](https://www.dropbox.com/s/77fqaj07w6i2g1o/Screenshot%202016-11-07%2018.19.24.png?dl=0)
![](https://www.dropbox.com/s/3amg7xzbuese4x4/Screenshot%202016-11-07%2018.19.40.png?dl=0)

#### Installing
- Clone the repo
- Create config.js (Optionally, see [configuration](#configuration))
- Start Hubbard (`npm start`)

#### Configuration
The only options that are __required__ are a valid [GitHub access token](https://github.com/settings/tokens)
with `repo` and `admin:repo_hook` scopes, and a publicly-accesible hostname. In
development, a hostname will be generated with [localtunnel](https://github.com/localtunnel/localtunnel).

Setting a password and secret are also __HIGHLY__ recommended, but it will work
without them.

Other options should be self explanatory and can be provided via config.js or environment variables

__config.js__
```javascript
'use strict'

module.exports = {              // Environment Variable Names

  environment: 'development',   // NODE_ENV
  password: '',                 // HUBBARD_PASSWORD
  port: 8080,                   // HUBBARD_PORT
  host: '0.0.0.0',              // HUBBARD_HOST
  use_https: false,             // HUBBARD_USE_HTTPS
  secret: 'not a good secret',  // HUBBARD_SECRET
  log_level: 'info'             // HUBBARD_LOG_LEVEL
  
}
```

or environment variables...

```bash
$ HUBBARD_GITHUB_ACCESS_TOKEN=<token> npm start
```
