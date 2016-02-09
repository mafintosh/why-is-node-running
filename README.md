# why-is-node-running

Node is running but you don't know why? why-is-node-running is here to help you.

```
npm install why-is-node-running
```

## Usage

``` js
var log = require('why-is-node-running')
var net = require('net')

function createServer () {
  var server = net.createServer()
  setInterval(function () {}, 1000)
  server.listen(0)
}

createServer()
createServer()

setTimeout(function () {
  log() // logs out active handles that are keeping node running
}, 100)
```

Running the above will print

```
There are 4 known handle(s) keeping the process running and 0 unknown
Known handles:

/Users/maf/dev/node_modules/why-is-node-running/example.js:6  - setInterval(function () {}, 1000)
/Users/maf/dev/node_modules/why-is-node-running/example.js:10 - createServer()

/Users/maf/dev/node_modules/why-is-node-running/example.js:7  - server.listen(0)
/Users/maf/dev/node_modules/why-is-node-running/example.js:10 - createServer()

/Users/maf/dev/node_modules/why-is-node-running/example.js:7  - server.listen(0)
/Users/maf/dev/node_modules/why-is-node-running/example.js:11 - createServer()

/Users/maf/dev/node_modules/why-is-node-running/example.js:13 - setTimeout(function () {
```

## License

MIT
