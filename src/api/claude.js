import { apiFetch } from './client'

export async function sendMessage(messages, systemPrompt) {
  const res = await apiFetch('/api/claude/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, system: systemPrompt }),
  })
  const data = await res.json()
  if (!res.ok) {
    const detail = data.detail
    const msg = typeof detail === 'string' ? detail
      : Array.isArray(detail) ? detail.map(d => d.msg).join(', ')
      : `Claude API 오류 (${res.status})`
    throw new Error(msg)
  }
  return data
}

export async function fetchSignals(symbols) {
  const res = await apiFetch('/api/claude/signals', {
    method: 'POST',
    body: JSON.stringify({ symbols }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail = err.detail
    const msg = typeof detail === 'string' ? detail
      : detail?.error?.message ?? `분석 서버 오류 (${res.status})`
    throw new Error(msg)
  }
  return res.json()
}

export async function searchTicker(query) {
  const res = await apiFetch('/api/claude/search-ticker', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  if (!res.ok) return []
  const text = data.content?.find(b => b.type === 'text')?.text || '[]'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return []
  }
}
