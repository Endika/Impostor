import { useEffect } from 'react'

// The browser drops the lock whenever the page is hidden, so it is taken
// again each time the page becomes visible.
export function useWakeLock(): void {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    const wakeLock = navigator.wakeLock
    let sentinel: WakeLockSentinel | null = null
    let disposed = false

    function acquire() {
      if (document.visibilityState !== 'visible') return
      if (sentinel && !sentinel.released) return
      wakeLock
        .request('screen')
        .then((acquired) => {
          if (disposed) {
            void acquired.release().catch(() => undefined)
            return
          }
          sentinel = acquired
        })
        .catch(() => undefined)
    }

    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', acquire)
      void sentinel?.release().catch(() => undefined)
    }
  }, [])
}
