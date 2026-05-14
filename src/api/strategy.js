import { apiFetch } from './client'

export async function fetchMarketRegime() {
  const res = await apiFetch('/api/market/regime')
  if (!res.ok) throw new Error('Market regime fetch failed')
  return res.json()
}

export async function fetchTradingMode() {
  const res = await apiFetch('/api/market/trading-mode')
  if (!res.ok) throw new Error('Trading mode fetch failed')
  return res.json()
}

export async function setTradingMode(mode) {
  const res = await apiFetch('/api/market/trading-mode', {
    method: 'PUT',
    body: JSON.stringify({ mode }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || '모드 변경 실패')
  return data
}

export async function fetchStrategies(mode) {
  const params = mode ? `?mode=${mode}` : ''
  const res = await apiFetch(`/api/strategy${params}`)
  if (!res.ok) throw new Error('Strategy fetch failed')
  return res.json()
}

export async function createStrategy(body) {
  const res = await apiFetch('/api/strategy', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || '전략 생성 실패')
  return data
}

export async function toggleStrategy(sid) {
  const res = await apiFetch(`/api/strategy/${sid}/toggle`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Toggle failed')
  return res.json()
}

export async function deleteStrategy(sid) {
  const res = await apiFetch(`/api/strategy/${sid}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
  return res.json()
}

export async function fetchWatchdogStatus() {
  const res = await apiFetch('/api/strategy/watchdog/status')
  if (!res.ok) throw new Error('Watchdog status fetch failed')
  return res.json()
}

export async function updateWatchdogConfig(config) {
  const res = await apiFetch('/api/strategy/watchdog/config', {
    method: 'POST',
    body: JSON.stringify(config),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Watchdog config update failed')
  return data
}

export async function fetchTradeHistory({ limit = 50, offset = 0, status = '', symbol = '', mode = '', source = '' } = {}) {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  if (symbol) params.set('symbol', symbol)
  if (mode) params.set('mode', mode)
  if (source) params.set('source', source)
  const res = await apiFetch(`/api/strategy/trade-history?${params}`)
  if (!res.ok) throw new Error('Trade history fetch failed')
  return res.json()
}
