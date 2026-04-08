const API_URL = 'https://api.anthropic.com/v1/messages'

export async function sendMessage(apiKey, messages, systemPrompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Claude API 오류')
  return data
}

export async function searchTicker(apiKey, query) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `"${query}"와 관련된 미국 상장 주식 티커를 최대 5개 찾아줘. JSON 배열만 반환해. 형식: [{"sym":"AAPL","name":"Apple Inc."},...]`
      }]
    })
  })
  const data = await res.json()
  const text = data.content?.find(b => b.type === 'text')?.text || '[]'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return []
  }
}
