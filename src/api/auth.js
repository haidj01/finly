const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function apiLogin(username, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || '로그인 실패')
  return data
}

export async function apiMFAVerify(tempToken, code) {
  const res = await fetch(`${BASE}/api/auth/mfa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ temp_token: tempToken, code }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'MFA 인증 실패')
  return data
}

export async function apiMFASetup() {
  const res = await fetch(`${BASE}/api/auth/mfa/setup`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'MFA 설정 실패')
  return data
}
