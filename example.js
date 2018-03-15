const log = require('./');
const net = require('net');

function createServer () {
    const server = net.createServer();
    setInterval(function () {}, 1000);
    server.listen(0);
}

createServer();
createServer();

setTimeout(function () {
    log();
}, 100);