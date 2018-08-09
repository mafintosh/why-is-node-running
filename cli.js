#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path')

var prog = process.argv.slice(2)

console.log('probing program', prog.join(' '))

var nodeArgs = [
  '-r',
  path.join(__dirname, 'include.js')
]
var nodeOpts = { stdio: 'inherit' }
var child = spawn('node', nodeArgs.concat(prog), nodeOpts)

console.log('kill -SIGUSR1', child.pid, 'for logging')
