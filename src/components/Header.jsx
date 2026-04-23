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
  { key: 'chat',      label: 'AI Agent' },
]

export default function Header() {
  const { view, setView } = useStore()
  const marketOpen = useMarket()
  const versions = useVersions()

  return (
    <header className="flex items-center justify-between px-6 h-[58px] bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
      <div className="text-xl font-bold tracking-tight">
        Fin<span className="text-accent">ly</span>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
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

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          marketOpen ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${marketOpen ? 'bg-accent animate-pulse' : 'bg-red-400'}`} />
          {marketOpen ? 'Market Open' : 'Market Closed'}
        </div>
      </div>
    </header>
  )
}
