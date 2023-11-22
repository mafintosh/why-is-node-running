declare module 'why-is-node-running' {
  interface Logger {
    error: (message?: any, ...optionalParams: any[]) => void;
  }
  export default function whyIsNodeRunning(logger: Logger): void;
}
  