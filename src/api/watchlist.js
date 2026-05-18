import { apiFetch } from './client'

export async function fetchWatchlist() {
  const res = await apiFetch('/api/watchlist')
  if (!res.ok) return []
  return res.json()
}

export async function addWatchlistItem(symbol, company_name = '') {
  const res = await apiFetch('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({ symbol, company_name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'watchlist 추가 실패')
  }
  return res.json()
}

export async function removeWatchlistItem(symbol) {
  const res = await apiFetch(`/api/watchlist/${symbol}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('watchlist 삭제 실패')
  return res.json()
}
