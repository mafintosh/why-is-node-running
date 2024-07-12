import whyIsNodeRunning from './index.js'

process.on('SIGINFO', () => whyIsNodeRunning())
process.on('SIGUSR1', () => whyIsNodeRunning())

console.log('kill -SIGUSR1', process.pid, 'for logging')
