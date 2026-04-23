import { apiFetch } from './client'

export async function fetchAccount() {
  const res = await apiFetch('/api/alpaca/account')
  if (!res.ok) throw new Error('Account fetch failed')
  return res.json()
}

export async function fetchPositions() {
  const res = await apiFetch('/api/alpaca/positions')
  if (!res.ok) throw new Error('Positions fetch failed')
  return res.json()
}

export async function fetchLatestPrices(symbols) {
  const res = await apiFetch(`/api/alpaca/prices?symbols=${symbols.join(',')}`)
  if (!res.ok) throw new Error('Price fetch failed')
  return res.json()
}

export async function fetchAsset(sym) {
  const res = await apiFetch(`/api/alpaca/asset/${sym}`)
  if (!res.ok) return null
  return res.json()
}

export async function fetchOrders(status = 'all', limit = 20) {
  const res = await apiFetch(`/api/alpaca/orders?status=${status}&limit=${limit}`)
  if (!res.ok) throw new Error('Orders fetch failed')
  return res.json()
}

export async function fetchNews(symbols) {
  const res = await apiFetch(`/api/news?symbols=${symbols.join(',')}`)
  if (!res.ok) throw new Error('News fetch failed')
  return res.json()
}

export async function placeOrder({ symbol, qty, side }) {
  const res = await apiFetch('/api/alpaca/orders', {
    method: 'POST',
    body: JSON.stringify({ symbol, qty, side }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || '주문 실패')
  return data
}
