import { createHook } from 'node:async_hooks'
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCallSites } from 'node:util'



const isStdio = resource => {
  try {
    return resource[Object.getOwnPropertySymbols(resource)[0]]._isStdio
  } catch {
    return false
  }
}

export const ASYNC_TYPE_INFO = new Map([
  ['TCPWRAP', { blocks: 'yes', label: 'TCP socket' }],
  ['TCPSERVERWRAP', { blocks: 'yes', label: 'TCP server' }],
  ['PIPEWRAP', { blocks: 'yes', label: 'Pipe' }],
  ['PIPECONNECTWRAP', { blocks: 'yes', label: 'Pipe connection' }],
  ['TTYWRAP', { blocks: isStdio, label: 'TTY' }],
  ['UDPWRAP', { blocks: 'yes', label: 'UDP socket' }],
  ['SIGNALWRAP', { blocks: 'yes', label: 'Signal listener' }],
  ['PROCESSWRAP', { blocks: 'yes', label: 'Child process' }],
  ['WORKER', { blocks: 'yes', label: 'Worker' }],
  ['MESSAGEPORT', { blocks: 'yes', label: 'Message port' }],
  ['Timeout', { blocks: 'yes', label: 'Timeout' }],
  ['Immediate', { blocks: 'yes', label: 'Immediate' }],
  ['FSREQCALLBACK', { blocks: 'yes', label: 'Filesystem request' }],
  ['GETADDRINFOREQWRAP', { blocks: 'yes', label: 'DNS lookup request' }],
  ['GETNAMEINFOREQWRAP', { blocks: 'yes', label: 'Reverse DNS lookup request' }],
  ['CONNECTWRAP', { blocks: 'yes', label: 'Socket connection attempt' }],
  ['PIPECONNECTWRAP', { blocks: 'yes', label: 'Pipe connection' }],
  ['WRITEWRAP', { blocks: 'yes', label: 'Write request' }],
  ['SHUTDOWNWRAP', { blocks: 'yes', label: 'Socket shutdown' }],
  ['STATWATCHER', { blocks: 'yes', label: 'File stat watcher' }],
  ['FSEVENTWRAP', { blocks: 'yes', label: 'Filesystem event watcher' }],
  ['ZLIB', { blocks: 'yes', label: 'Zlib operation' }],
  ['DNSCHANNEL', { blocks: 'yes', label: 'DNS channel' }],
  ['PROMISE', { blocks: 'no', label: 'Promise' }],
  ['TickObject', { blocks: 'no', label: 'Tick object' }],
  ['Microtask', { blocks: 'no', label: 'Microtask' }],
  ['PerformanceObserver', { blocks: 'no', label: 'Performance observer' }],
  ['RANDOMBYTESREQUEST', { blocks: 'no', label: 'Random bytes request' }],
  ['HTTPPARSER', { blocks: 'no', label: 'HTTP parser' }],
])

const asyncResources = new Map()
const hook = createHook({
  init (asyncId, type, triggerAsyncId, resource) {
    // process._getActiveHandles() and process._getActiveRequests() are
    // undocumented APIs that return the internal lists of active handles and
    // requests which are keeping the event loop alive. But they don't include
    // timers and they don't include stack traces, so we use async hooks to track
    // those ourselves.

    const info = ASYNC_TYPE_INFO.get(type)
    if (info) {
      if (info.blocks === 'no') return
      if (typeof info.blocks === 'function' && !info.blocks(resource)) return
    }

    const stacks = getCallSites().slice(1)

    asyncResources.set(asyncId, {
      type,
      resourceRef: new WeakRef(resource),
      stacks
    })
  },
  destroy (asyncId) {
    asyncResources.delete(asyncId)
  }
})

hook.enable()

export default function whyIsNodeRunning (logger = console) {
  hook.disable()

  const activeAsyncResources = Array.from(asyncResources.values())
    .filter(({ resourceRef }) => {
      const resource = resourceRef.deref()

      if (resource === undefined) {
        return false
      }

      return resource.hasRef?.() ?? true
    })

  logger.error(`There are ${activeAsyncResources.length} handle(s) keeping the process running.`)

  for (const asyncResource of activeAsyncResources) {
    printStacks(asyncResource, logger)
  }
}

function printStacks (asyncResource, logger) {
  const stacks = asyncResource.stacks.filter((stack) => {
    const fileName = stack.scriptName
    return fileName !== null && !fileName.startsWith('node:')
  })

  logger.error('')
  const info = ASYNC_TYPE_INFO.get(asyncResource.type)
  logger.error(`# ${info?.label ?? asyncResource.type}`)

  if (!stacks[0]) {
    logger.error('(unknown stack trace)')
    return
  }

  const maxLength = stacks.reduce((length, stack) => Math.max(length, formatLocation(stack).length), 0)

  for (const stack of stacks) {
    const location = formatLocation(stack)
    const padding = ' '.repeat(maxLength - location.length)

    try {
      const lines = readFileSync(normalizeFilePath(stack.scriptName), 'utf-8').split(/\n|\r\n/)
      const line = lines[stack.lineNumber - 1].trim()

      logger.error(`${location}${padding} - ${line}`)
    } catch (e) {
      logger.error(`${location}${padding}`)
    }
  }
}

function formatLocation (stack) {
  const filePath = formatFilePath(stack.scriptName)
  return `${filePath}:${stack.lineNumber}`
}

function formatFilePath (filePath) {
  const absolutePath = normalizeFilePath(filePath)
  const relativePath = relative(process.cwd(), absolutePath)

  return relativePath.startsWith('..') ? absolutePath : relativePath
}

function normalizeFilePath (filePath) {
  return filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath
}
