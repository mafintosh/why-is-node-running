import { createHook } from 'node:async_hooks'
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import stackback from 'stackback'

const IGNORED_TYPES = [
  'TIMERWRAP',
  'PROMISE',
  'PerformanceObserver',
  'RANDOMBYTESREQUEST'
]

const asyncResources = new Map()
const hook = createHook({
  init (asyncId, type, triggerAsyncId, resource) {
    if (IGNORED_TYPES.includes(type)) {
      return
    }

    const stacks = stackback(new Error()).slice(1)

    asyncResources.set(asyncId, { type, stacks, resource })
  },
  destroy (asyncId) {
    asyncResources.delete(asyncId)
  }
})

hook.enable()

export default function whyIsNodeRunning (logger = console) {
  hook.disable()

  const activeAsyncResources = Array.from(asyncResources.values())
    .filter(({ resource }) => resource.hasRef?.() ?? true)

  logger.error(`There are ${activeAsyncResources.length} handle(s) keeping the process running.`)

  for (const asyncResource of activeAsyncResources) {
    printStacks(asyncResource, logger)
  }
}

function printStacks (asyncResource, logger) {
  const stacks = asyncResource.stacks.filter((stack) => !stack.getFileName().startsWith('node:'))

  logger.error('')
  logger.error(`# ${asyncResource.type}`)

  if (!stacks[0]) {
    logger.error('(unknown stack trace)')
    return
  }

  const maxLength = stacks.reduce((length, stack) => Math.max(length, formatLocation(stack).length), 0)

  for (const stack of stacks) {
    const location = formatLocation(stack)
    const padding = ' '.repeat(maxLength - location.length)
    
    try {
      const lines = readFileSync(normalizeFilePath(stack.getFileName()), 'utf-8').split(/\n|\r\n/)
      const line = lines[stack.getLineNumber() - 1].trim()

      logger.error(`${location}${padding} - ${line}`)
    } catch (e) {
      logger.error(`${location}${padding}`)
    }
  }
}

function formatLocation (stack) {
  const filePath = formatFilePath(stack.getFileName())
  return `${filePath}:${stack.getLineNumber()}`
}

function formatFilePath (filePath) {
  const absolutePath = normalizeFilePath(filePath)
  const relativePath = relative(process.cwd(), absolutePath)

  return relativePath.startsWith('..') ? absolutePath : relativePath
}

function normalizeFilePath (filePath) {
  return filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath
}
