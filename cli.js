#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path')

var prog = path.resolve(process.argv[2])

console.log('probing program', prog)

var nodeArgs = [
  '-r',
  path.join(__dirname, 'include.js')
]
var nodeOpts = { stdio: 'inherit' }
var child = spawn('node', nodeArgs.concat(prog), nodeOpts)

console.log('kill -SIGUSR1', child.pid, 'for logging')
