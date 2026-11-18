import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

const POLL_INTERVAL_MS = 15_000

// Green dot when GET /api/bridge/health answers 200, red on 502/network
// failure. Re-checked on mount and every 15 seconds.
export default function BackendStatus() {
  const [state, setState] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function check() {
      const res = await apiGet('/api/bridge/health')
      if (cancelled) return
      if (res.ok && res.status === 200) {
        setState('online')
      } else {
        setState('offline')
      }
    }

    check()
    const timer = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="backend-status" role="status" aria-live="polite">
      <span className={`status-dot ${state}`} />
      <span className="status-label">
        Backend: {state === 'online' ? 'Online' : state === 'offline' ? 'Offline' : 'Checking…'}
      </span>
    </div>
  )
}
