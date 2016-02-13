#!/usr/bin/env node

var why = require('./')
var path = require('path')
var prog = path.resolve(process.argv[2])

console.log('probing program', prog)
console.log('kill -SIGUSR1', process.pid, 'for logging')

require(prog)

process.on('SIGUSR1', why)
