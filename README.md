# Hubbard

GitHub Deployments, Simplified.

#### What it does
- Registers GitHub webhooks for enabled repositories
- Pulls the latest version after a push
- Runs user-defined setup/teardown scripts

#### What it doesn't do
- Attempt to figure out the deployment strategy (npm start, docker start, etc.)
- Daemonize your process or restart it if it dies (that's up to you)

Hubbard is essentially a glorified git post-checkout hook with GitHub mojo. That's it.

## Screenshots
![](http://i.imgur.com/aSUnWcC.png)
![](http://i.imgur.com/WDnFjdK.png)
![](http://i.imgur.com/yxcoY5T.png)

## Usage

```bash
$ npm install -g hubbard
$ hubbard --help

  Usage: hubbard [command]


  Commands:

    start   Start Hubbard server as a daemon
    stop    Stop running Hubbard server

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -c, --config [config file]        Configuration file to use
    -h, --host [host]                 Hostname to bind server and webhooks
    -p, --port [port]                 Port to bind server and webhooks [8080]
    -s, --use-https                   Use HTTPS
    -t, --access-token [token]        GitHub personal access token
    --pass, --password [password]     Login password
    --data, --data-dir [directory]    Directory to store nedb data in
    --repos, --repos-dir [directory]  Directory to store repositories in
    -l, --log-file [file]             File to write logs to
    -ll, --log-level [level]          Logfile verbosity [err, info, verbose]
    -lf, --log-file-format [format]   Format to log to logfile [text, json]
    -pf, --pid-file [file]            File to output process id to
```

You may also clone this repo and use config.js, or environment variables.

__NOTE__: You shouldn't put your GitHub access token in config.js, nor any other
sensitive values in your repos' scripts, to avoid exposing them in plain-text
on disk. Any environment variables accessible to Hubbard will be accessible in your scripts.

<!-- ## I NEED MOAR
[Read the wiki](https://github.com/caseyWebb/hubbard/wiki) -->
