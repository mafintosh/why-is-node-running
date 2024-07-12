#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'

const [prog, ...progArgs] = process.argv.slice(2)

console.info('probing program', prog)

const args = [
  '--import',
  path.join(import.meta.dirname, 'include.js'),
  prog,
  ...progArgs
]

spawn('node', args, { stdio: 'inherit' })
