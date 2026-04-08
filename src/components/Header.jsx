import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import SettingsModal from './shared/SettingsModal'

function useMarket() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
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

export default function Header() {
  const { view, setView, alpacaKey, claudeKey } = useStore()
  const [showSettings, setShowSettings] = useState(false)
  const marketOpen = useMarket()
  const alpacaOn = !!(alpacaKey)
  const claudeOn = !!(claudeKey)

  return (
    <>
      <header className="flex items-center justify-between px-6 h-[58px] bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
        <div className="text-xl font-bold tracking-tight">
          Fin<span className="text-accent">ly</span>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {['dashboard', 'chat'].map((v, i) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-1.5 rounded-[9px] text-sm font-medium transition-all ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {i === 0 ? 'Dashboard' : 'AI Agent'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Claude status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            claudeOn ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-accent hover:text-accent-dark hover:bg-accent-light'
          }`} onClick={() => setShowSettings(true)}>
            <div className={`w-1.5 h-1.5 rounded-full ${claudeOn ? 'bg-blue-500' : 'bg-gray-300'}`} />
            {claudeOn ? 'Claude 연결됨' : 'Claude 설정'}
          </div>

          {/* Alpaca status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            alpacaOn ? 'bg-accent-light text-accent-dark border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-accent hover:text-accent-dark hover:bg-accent-light'
          }`} onClick={() => setShowSettings(true)}>
            <div className={`w-1.5 h-1.5 rounded-full ${alpacaOn ? 'bg-accent animate-pulse' : 'bg-gray-300'}`} />
            {alpacaOn ? 'Alpaca 연결됨' : 'Alpaca 연결'}
          </div>

          {/* Market status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            marketOpen ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${marketOpen ? 'bg-accent animate-pulse' : 'bg-red-400'}`} />
            {marketOpen ? 'Market Open' : 'Market Closed'}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
