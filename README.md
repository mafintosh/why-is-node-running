# why-is-node-running

Node.js is running but you don't know why? `why-is-node-running` is here to help you.

## Installation

If you want to use `why-is-node-running` in your code, you can install it as a local dependency of your project. If you want to use it as a CLI, you can install it globally, or use `npx` to run it without installing it.

### As a local dependency

Node.js 20.11 and above (ECMAScript modules):

```bash
npm install --save-dev why-is-node-running
```

Node.js 8 or higher (CommonJS):

```bash
npm install --save-dev why-is-node-running@v2.x
```

### As a global package

```bash
npm install --global why-is-node-running
why-is-node-running /path/to/some/file.js
```

Alternatively if you do not want to install the package globally, you can run it with [`npx`](https://docs.npmjs.com/cli/commands/npx):

```bash
npx why-is-node-running /path/to/some/file.js
```

## Usage (as a dependency)

```js
import whyIsNodeRunning from 'why-is-node-running' // should be your first import
import { createServer } from 'node:net'

function startServer () {
  const server = createServer()
  setInterval(() => {}, 1000)
  server.listen(0)
}

startServer()
startServer()

// logs out active handles that are keeping node running
setImmediate(() => whyIsNodeRunning())
```

Save the file as `example.js`, then execute:

```bash
node ./example.js
```

Here's the output:

```
There are 4 handle(s) keeping the process running

# Timeout
example.js:6  - setInterval(() => {}, 1000)
example.js:10 - startServer()

# TCPSERVERWRAP
example.js:7  - server.listen(0)
example.js:10 - startServer()

# Timeout
example.js:6  - setInterval(() => {}, 1000)
example.js:11 - startServer()

# TCPSERVERWRAP
example.js:7  - server.listen(0)
example.js:11 - startServer()
```

## Usage (as a CLI)

You can run `why-is-node-running` as a standalone if you don't want to include it inside your code. Sending `SIGUSR1`/`SIGINFO` signal to the process will produce the log. (`Ctrl + T` on macOS and BSD systems)

```bash
why-is-node-running /path/to/some/file.js
```

```
probing module /path/to/some/file.js
kill -SIGUSR1 31115 for logging
```

To trigger the log:

```
kill -SIGUSR1 31115
```

## Usage (with Node.js' `--import` option)

You can also use Node's [`--import`](https://nodejs.org/api/cli.html#--importmodule) option to preload `why-is-node-running`:

```bash
node --import why-is-node-running/include /path/to/some/file.js
```

The steps are otherwise the same as the above CLI section

## License

MIT
