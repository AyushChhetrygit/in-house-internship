import { useEffect, useRef } from 'react'

/**
 * Calls `callback` immediately and then every `intervalMs` milliseconds.
 * Cleans up on unmount.
 */
export function useAutoRefresh(callback, intervalMs = 180000) {
  useEffect(() => {
    callback()
    const id = setInterval(callback, intervalMs)
    return () => clearInterval(id)
  }, [callback, intervalMs])
}
