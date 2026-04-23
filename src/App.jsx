import React, { useEffect } from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import Trending from './components/Trending/Trending'
import Chat from './components/Chat/Chat'
import LoginPage from './components/Login/LoginPage'
import MFAPage from './components/Login/MFAPage'
import StockDetail from './components/StockDetail/StockDetail'

export default function App() {
  const { view, isAuthenticated, authStep, logout } = useStore()

  // 토큰 만료(401) 이벤트 수신 → 로그아웃
  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('finly:logout', handler)
    return () => window.removeEventListener('finly:logout', handler)
  }, [logout])

  if (!isAuthenticated) {
    return authStep === 'mfa' ? <MFAPage /> : <LoginPage />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {view === 'dashboard' && <Dashboard />}
          {view === 'trending'  && <Trending />}
          {view === 'stock'     && <StockDetail />}
          {view === 'chat'      && <Chat />}
        </main>
      </div>
    </div>
  )
}
