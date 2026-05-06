import React from 'react'
import { useStore } from '../store/useStore'
import { useVersions } from '../hooks/useVersions'

function useMarket() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const check = () => {
      const ny = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const h = ny.getHours(), m = ny.getMinutes(), d = ny.getDay()
      setOpen(d >= 1 && d <= 5 && (h > 9 || (h === 9 && m >= 30)) && h < 16)
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [])
  return open
}

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'trending',  label: '주목 종목' },
  { key: 'stock',     label: '종목 조회' },
  { key: 'chat',      label: 'AI Agent' },
  { key: 'history',   label: '매매 이력' },
]

export default function Header() {
  const { view, setView, setSidebarOpen } = useStore()
  const marketOpen = useMarket()
  const versions = useVersions()

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-[58px] bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="text-xl font-bold tracking-tight">
          Fin<span className="text-accent">ly</span>
        </div>
      </div>

      {/* Desktop nav tabs */}
      <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-5 py-1.5 rounded-[9px] text-sm font-medium transition-all ${
              view === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-300 font-mono">
          <span title="frontend">fe:{versions.frontend}</span>
          <span>·</span>
          <span title="backend">be:{versions.backend ?? '…'}</span>
          <span>·</span>
          <span title="agent">ag:{versions.agent ?? '…'}</span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full text-xs font-semibold ${
          marketOpen ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${marketOpen ? 'bg-accent animate-pulse' : 'bg-red-400'}`} />
          <span className="hidden sm:inline">{marketOpen ? 'Market Open' : 'Market Closed'}</span>
          <span className="sm:hidden">{marketOpen ? 'Open' : 'Closed'}</span>
        </div>
      </div>
    </header>
  )
}
