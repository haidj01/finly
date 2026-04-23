import { apiFetch } from './client'

export async function sendMessage(messages, systemPrompt) {
  const res = await apiFetch('/api/claude/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, system: systemPrompt }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Claude API 오류')
  return data
}

export async function fetchSignals(symbols) {
  const res = await apiFetch('/api/claude/signals', {
    method: 'POST',
    body: JSON.stringify({ symbols }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `오류 ${res.status}`)
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
