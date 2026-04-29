const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function getToken() {
  return localStorage.getItem('finly_token')
}

export function saveToken(token) {
  localStorage.setItem('finly_token', token)
}

export function clearToken() {
  localStorage.removeItem('finly_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new Event('finly:logout'))
  }

  // CloudFront SPA fallback converts 404/403 from ALL origins (including ALB) into
  // 200 + index.html. Detect this by checking the Content-Type before returning.
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/html')) {
    return new Response(JSON.stringify({ detail: '요청한 리소스를 찾을 수 없습니다.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return res
}
