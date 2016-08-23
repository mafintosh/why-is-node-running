var core = require('./core')

var b = process.binding

process.binding = function (name) {
  var loaded = b(name)
  var cpy = {}

  Object.keys(loaded).forEach(function (prop) {
    if (typeof loaded[prop] === 'function' && loaded[prop].prototype) {
      var wrap = function () {
        var handle

        if (arguments.length === 4) handle = new loaded[prop](arguments[0], arguments[1], arguments[2], arguments[3])
        else if (arguments.length === 3) handle = new loaded[prop](arguments[0], arguments[1], arguments[2])
        else if (arguments.length === 2) handle = new loaded[prop](arguments[0], arguments[1])
        else if (arguments.length === 1) handle = new loaded[prop](arguments[0])
        else handle = new loaded[prop]()

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
  var unknown = 0
  var known = []

  process._getActiveHandles().forEach(function (handle) {
    var stacks = findStacks(handle, 0)
    if (stacks) return known.push(stacks)

    unknown++
  })

  return {known: known, unknown: unknown}
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
