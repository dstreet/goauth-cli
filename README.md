# goauth-cli

Dead-simple Google OAuth v2 login for the command line.

Goole OAuth v2 requires that users authenticate with Google via a web interface
provided by Google. This tool implements all the steps necessary to get
the refresh and access tokens in order to interact with the Google APIs from
the command line.

`goauth-cli` generates the login url and immediately opens a web browser to the
correct url. It also starts a temporary webserver to capture the authorization
code sent back by Google. Once the login process is complete, the webserver is
shutdown.

## Install

```
$ npm i goauth-cli
```

## Usage

```js
import { GoauthCli } from 'goauth-cli'

const auth = new GoauthCli(CLIENT_ID, CLIENT_SECRET, SCOPES)
const authClient = await auth.login()
```

## Login options

- `callbackport`: The port that the webserver will listen on. Defaults to a
random, available port
- `callbackPath`: The callback url path. Defaults to `/oauth-callback`.

## License

[Apache License Vesion 2.0](./LICENSE)
