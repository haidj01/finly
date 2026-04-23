import { apiFetch } from './client'

export async function fetchStrategies() {
  const res = await apiFetch('/api/strategy')
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
