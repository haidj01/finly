import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 이전 버전 localStorage 잔여 데이터 제거
;(function cleanStorage() {
  try { localStorage.removeItem('finly-store') } catch { /* ignore */ }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
