#!/usr/bin/env node

var path         = require('path')
var readFileSync = require('fs').readFileSync

var why = require('./')


var prog = path.resolve(process.argv[2])

console.log('probing program', prog)
console.log('kill -SIGUSR1', process.pid, 'for logging')

// Register debug signal
process.on('SIGUSR1', function()
{
  var handles = why()
  var known = handles.known

  console.error('There are %d known handle(s) keeping the process running and'+
                ' %d unknown', known.length, handles.unknown)
  console.error('Known handles:\n')

  known.forEach(function (obj, i) {
    console.error('# %s', obj.wrapped.name)

    var stacks = obj.stacks.filter(function (s) {
      return s.getFileName().indexOf(path.sep) > -1
    })

    if (!stacks[0]) {
      console.error('(unknown stack trace)')
    } else {
      // Calculate padding of the stacks
      var padding = ''
      stacks.forEach(function (s) {
        var prefix = s.getFileName() + ':' + s.getLineNumber()

        var pad = prefix.replace(/./g, ' ')
        if (pad.length > padding.length) padding = pad
      })

      // Show stack info
      stacks.forEach(function (s) {
        var prefix = s.getFileName() + ':' + s.getLineNumber()

        try {
          var src = readFileSync(s.getFileName(), 'utf-8').split(/\n|\r\n/)

          var suffix = ' - ' + src[s.getLineNumber() - 1].trim()
        } catch (e) {
          var suffix = ''
        }

        console.error(prefix + padding.slice(prefix.length) + suffix)
      })
    }

    // Separate known handles with an empty line
    console.error()
  })
})

// Start execution of the user program
require(prog)
