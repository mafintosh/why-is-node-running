var why = require('why-is-node-running')

var net = require('net')


function createServer () {
  var server = net.createServer()
  setInterval(function () {}, 1000)
  server.listen(0)
}


createServer()
createServer()

setTimeout(function () {
  console.error(why())
}, 100)
