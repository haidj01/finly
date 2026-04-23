import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 이전 버전에서 저장된 API 키 및 불필요한 상태 제거
;(function cleanStorage() {
  try {
    const raw = localStorage.getItem('finly-store')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const state = parsed?.state || {}
    const allowed = new Set(['watchlist'])
    const hasDirty = Object.keys(state).some(k => !allowed.has(k))
    if (hasDirty) {
      const clean = { state: { watchlist: state.watchlist }, version: parsed.version }
      localStorage.setItem('finly-store', JSON.stringify(clean))
    }
  } catch { /* 파싱 실패 시 무시 */ }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
