#!/usr/bin/env node

import { spawn } from 'node:child_process'
import path from 'node:path'

var prog = path.resolve(process.argv[2])
var progArgs = process.argv.slice(3)

console.log('probing program', prog)

var nodeArgs = [
  '--import',
  path.join(import.meta.dirname, 'include.js')
]
var nodeOpts = { stdio: 'inherit' }

spawn('node', nodeArgs.concat(prog).concat(progArgs), nodeOpts)
