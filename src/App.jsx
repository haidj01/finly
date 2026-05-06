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
import TradeHistory from './components/TradeHistory/TradeHistory'

const NAV_TABS = [
  {
    key: 'dashboard', label: '홈',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'trending', label: '주목',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    key: 'stock', label: '조회',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    key: 'chat', label: 'AI',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    key: 'history', label: '이력',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14"/>
        <path d="M3.05 11a9 9 0 1 0 .5-4M3 3v5h5"/>
      </svg>
    ),
  },
]

export default function App() {
  const { view, setView, isAuthenticated, authStep, logout, sidebarOpen, setSidebarOpen } = useStore()

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
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-50 w-72 bg-white shadow-xl overflow-y-auto scrollbar-thin">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
          {view === 'dashboard' && <Dashboard />}
          {view === 'trending'  && <Trending />}
          {view === 'stock'     && <StockDetail />}
          {view === 'chat'      && <Chat />}
          {view === 'history'   && <TradeHistory />}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex safe-area-bottom">
        {NAV_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              view === t.key ? 'text-accent' : 'text-gray-400'
            }`}
          >
            {t.icon}
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
