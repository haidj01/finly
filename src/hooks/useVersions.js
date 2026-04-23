import { useState, useEffect } from 'react'

export function useVersions() {
  const [versions, setVersions] = useState({
    frontend: __APP_VERSION__,
    backend:  null,
    agent:    null,
  })

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    fetch(`${BASE}/version`)
      .then(r => r.json())
      .then(data => {
        setVersions(prev => ({
          ...prev,
          backend: data.version       ?? 'N/A',
          agent:   data.agent_version ?? 'N/A',
        }))
      })
      .catch(() => {
        setVersions(prev => ({ ...prev, backend: 'N/A', agent: 'N/A' }))
      })
  }, [])

  return versions
}
