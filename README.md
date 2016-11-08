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

## Screenshots
![](http://i.imgur.com/aSUnWcC.png)
![](http://i.imgur.com/WDnFjdK.png)
![](http://i.imgur.com/yxcoY5T.png)

## Installing
- Clone the repo
- Create config.js (Optionally, see [configuration](#configuration))
- Start Hubbard (`npm start`)

## Configuration
The only options that are __required__ are a valid [GitHub access token](https://github.com/settings/tokens)
with `repo` and `admin:repo_hook` scopes, and a publicly-accesible hostname. In
development, a hostname will be generated with [localtunnel](https://github.com/localtunnel/localtunnel).

Setting a password is also __HIGHLY__ recommended, but it will work without one.

Other options should be self explanatory and can be provided via config.js or environment variables.

__config.js__
```javascript
'use strict'

module.exports = {              // Environment Variable Names

  environment: 'development',   // NODE_ENV
  password: '',                 // HUBBARD_PASSWORD
  port: 8080,                   // HUBBARD_PORT
  host: '0.0.0.0',              // HUBBARD_HOST
  use_https: false,             // HUBBARD_USE_HTTPS
  log_level: 'info'             // HUBBARD_LOG_LEVEL

}
```

```bash
$ HUBBARD_GITHUB_ACCESS_TOKEN=<token> npm start
```

__NOTE__: You shouldn't put your GitHub access token in config.js, nor any other
sensitive values in your repos' scripts, to avoid exposing them in plain-text
on disk. Any environment variables accessible to Hubbard will be accessible in your scripts.

## I NEED MOAR
[Read the wiki](https://github.com/caseyWebb/hubbard/wiki)
