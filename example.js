import whyIsNodeRunning from './index.js'
import net from 'node:net'

function createServer () {
  var server = net.createServer()
  setInterval(function () {}, 1000)
  server.listen(0)
}

createServer()
createServer()

setTimeout(function () {
  whyIsNodeRunning()
}, 100)
