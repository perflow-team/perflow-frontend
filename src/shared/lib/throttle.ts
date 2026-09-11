export function throttle<Args extends unknown[]>(fn: (...args: Args) => void, wait: number) {
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Args | null = null

  const invoke = (args: Args) => {
    lastCall = Date.now()
    fn(...args)
  }

  return (...args: Args) => {
    const remaining = wait - (Date.now() - lastCall)
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      invoke(args)
    } else {
      pendingArgs = args
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null
          if (pendingArgs) invoke(pendingArgs)
        }, remaining)
      }
    }
  }
}
