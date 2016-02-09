var core = require('./core')

var b = process.binding

process.binding = function (name) {
  var loaded = b(name)
  var cpy = {}

  Object.keys(loaded).forEach(function (prop) {
    if (typeof loaded[prop] === 'function' && loaded[prop].prototype) {
      var wrap = function () {
        var handle = new loaded[prop]()
        var e = new Error('whatevs')
        var stacks = require('stackback')(e)
        var path = require('path')

        handle.__WHY_IS_NODE_RUNNING__ = {stacks: [], wrapped: loaded[prop]}

        for (var i = 1; i < stacks.length; i++) {
          handle.__WHY_IS_NODE_RUNNING__.stacks.push(stacks[i])
        }

        return handle
      }

      Object.keys(loaded[prop]).forEach(function (name) {
        wrap[name] = loaded[prop][name]
      })

      if (/^[A-Z]/.test(prop)) {
        cpy[prop] = wrap
      } else {
        cpy[prop] = loaded[prop]
      }
    } else {
      cpy[prop] = loaded[prop]
    }
  })

  return cpy
}

core.globalTimeouts()

module.exports = function () {
  var handles = process._getActiveHandles()
  var unknown = 0
  var known = []

  handles.forEach(function (handle) {
    var stacks = findStacks(handle, 0)
    if (stacks) {
      known.push(stacks)
      return
    }

    unknown++
  })

  console.error('There are %d known handle(s) keeping the process running and %d unknown', known.length, unknown)
  console.error('Known handles:\n')
  known.forEach(function (obj, i) {
    var stacks = obj.stacks

    stacks = stacks.filter(function (s) {
      return s.getFileName().indexOf(require('path').sep) > -1
    })

    console.error('# %s', obj.wrapped.name)

    if (!stacks[0]) {
      console.error('(unknown stack trace)')
    } else {
      var padding = ''
      stacks.forEach(function (s) {
        var pad = (s.getFileName() + ':' + s.getLineNumber()).replace(/./g, ' ')
        if (pad.length > padding.length) padding = pad
      })
      stacks.forEach(function (s) {
        var src = require('fs').readFileSync(s.getFileName(), 'utf-8').split(/\n|\r\n/)
        var prefix = s.getFileName() + ':' + s.getLineNumber()
        console.error(prefix + padding.slice(prefix.length) + ' - ' + src[s.getLineNumber() - 1].trim())
      })
    }
    console.error()
  })
}

function findStacks (obj, depth) {
  if (depth === 10) return null

  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
    var val = obj[keys[i]]
    if (keys[i] === '__WHY_IS_NODE_RUNNING__') return val
    if (typeof val === 'object' && val) {
      val = findStacks(val, depth + 1)
      if (val) return val
    }
  }
}
