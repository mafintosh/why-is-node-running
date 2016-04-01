# why-is-node-running

Node is running but you don't know why? why-is-node-running is here to help you.

```sh
npm install why-is-node-running
```

## Usage

```js
var log = require('why-is-node-running') // should be your first require

var net = require('net')


function createServer () {
  var server = net.createServer()
  setInterval(function () {}, 1000)
  server.listen(0)
}


createServer()
createServer()

setTimeout(function () {
  console.error(why())  // logs out active handles that are keeping node running
}, 100)
```

Running the above will print

```
There are 4 known handle(s) keeping the process running and 0 unknown
Known handles:

# Timer
/Users/maf/dev/node_modules/why-is-node-running/example.js:6  - setInterval(function () {}, 1000)
/Users/maf/dev/node_modules/why-is-node-running/example.js:10 - createServer()

# TCP
/Users/maf/dev/node_modules/why-is-node-running/example.js:7  - server.listen(0)
/Users/maf/dev/node_modules/why-is-node-running/example.js:10 - createServer()

# TCP
/Users/maf/dev/node_modules/why-is-node-running/example.js:7  - server.listen(0)
/Users/maf/dev/node_modules/why-is-node-running/example.js:11 - createServer()

# Timer
/Users/maf/dev/node_modules/why-is-node-running/example.js:13 - setTimeout(function () {
```

## CLI

You can also run `why-is-node-running` standalone if you don't want to include it inside your code. Sending `SIGUSR1` signal to the process will produce the log.

```sh
npm install why-is-node-running -g
```

```sh
why-is-node-running /path/to/some/file.js
probing module /path/to/some/file.js
kill -SIGUSR1 31115 for logging
```

To trigger the log do:

```sh
kill -SIGUSR1 31115
```

## License

MIT
