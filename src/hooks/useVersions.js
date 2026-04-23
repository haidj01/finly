import { useState, useEffect } from 'react'

const AGENT_URL = import.meta.env.VITE_AGENT_URL || 'http://localhost:8001'

export function useVersions() {
  const [versions, setVersions] = useState({
    frontend: __APP_VERSION__,
    backend:  null,
    agent:    null,
  })

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    Promise.allSettled([
      fetch(`${BASE}/version`).then(r => r.json()),
      fetch(`${AGENT_URL}/version`).then(r => r.json()),
    ]).then(([backendRes, agentRes]) => {
      setVersions(prev => ({
        ...prev,
        backend: backendRes.status === 'fulfilled' ? backendRes.value.version : 'N/A',
        agent:   agentRes.status  === 'fulfilled' ? agentRes.value.version  : 'N/A',
      }))
    })
  }, [])

  return versions
}
