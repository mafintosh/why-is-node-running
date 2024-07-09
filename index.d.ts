/**
 * An interface that can be implemented to customize how information is logged. For example:
 *
 * ```ts
 * import whyIsNodeRunning, { type Logger } from 'why-is-node-running'
 * 
 * const logger: Logger = {
 *   error(message) {
 *     console.error(message)
 *   }
 * }
 * 
 * whyIsNodeRunning(logger)
 * ```
 */
export interface Logger {
  error(message: string): void
}

/**
 * Logs the locations of all the active handles that prevent Node.js from exiting.
 * 
 * @param logger An optional {@link Logger} to use for logging messages. If not provided, the console will be used.
 */
export default function whyIsNodeRunning(logger?: Logger): void
