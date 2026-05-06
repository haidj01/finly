import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { fetchAsset, fetchLatestPrices } from '../../api/alpaca'
import { searchTicker } from '../../api/claude'
import WatchlistItem from './WatchlistItem'
import AlpacaAccount from './AlpacaAccount'

export default function Sidebar({ onClose }) {
  const { watchlist, addWatch } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [sym, setSym] = useState('')
  const [name, setName] = useState('')
  const [symStatus, setSymStatus] = useState('')
  const [nameStatus, setNameStatus] = useState('')
  const [results, setResults] = useState([])
  const [symTimer, setSymTimer] = useState(null)
  const [nameTimer, setNameTimer] = useState(null)

  const onSymChange = (v) => {
    const val = v.toUpperCase()
    setSym(val)
    clearTimeout(symTimer)
    if (!val) return
    setSymTimer(setTimeout(() => lookupTicker(val), 400))
  }

  const lookupTicker = async (s) => {
    setSymStatus('검색 중...')
    const asset = await fetchAsset(s)
    if (asset) {
      setName(asset.name || s)
      setSymStatus('✓ 확인됨')
      setResults([])
    } else {
      setSymStatus('없는 종목')
    }
  }

  const onNameChange = (v) => {
    setName(v)
    clearTimeout(nameTimer)
    if (!v || v.length < 2) { setResults([]); return }
    setNameTimer(setTimeout(() => searchName(v), 600))
  }

  const searchName = async (q) => {
    setNameStatus('검색 중...')
    const res = await searchTicker(q)
    setResults(res)
    setNameStatus(res.length ? `${res.length}개 발견` : '결과 없음')
  }

  const selectResult = (s, n) => {
    setSym(s); setName(n); setResults([])
    setSymStatus('✓ 선택됨'); setNameStatus('')
  }

  const confirmAdd = async () => {
    if (!sym) return
    const prices = await fetchLatestPrices([sym]).catch(() => ({}))
    const price = prices[sym] || 0
    addWatch({ sym, co: name || sym, price, chg: 0, up: true })
    setShowModal(false)
    setSym(''); setName(''); setResults([])
    setSymStatus(''); setNameStatus('')
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto scrollbar-thin">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:hidden">
          <span className="text-sm font-semibold text-gray-700">메뉴</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
          >×</button>
        </div>
      )}

      {/* WATCHLIST */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Watchlist</span>
          <button
            onClick={() => setShowModal(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:border-accent hover:text-accent hover:bg-accent-light transition-all text-base leading-none"
          >+</button>
        </div>
        <div className="space-y-0.5">
          {watchlist.map(item => <WatchlistItem key={item.sym} item={item} />)}
        </div>
      </div>

      {/* ALPACA ACCOUNT */}
      <AlpacaAccount />

      {/* ADD WATCHLIST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-7 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-1">+ Watchlist 추가</h3>
            <p className="text-sm text-gray-400 mb-5">티커 또는 회사명으로 검색하세요.</p>

            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">티커 심볼</label>
            <div className="relative mb-3">
              <input
                value={sym}
                onChange={e => onSymChange(e.target.value)}
                placeholder="예: AAPL"
                maxLength={6}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 font-mono font-bold text-sm uppercase outline-none focus:border-accent focus:bg-white transition-all pr-24"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${symStatus.includes('✓') ? 'text-accent-dark' : 'text-red-500'}`}>{symStatus}</span>
            </div>

            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">회사명 <span className="text-gray-300 font-normal normal-case">(회사명으로 검색 가능)</span></label>
            <div className="relative mb-3">
              <input
                value={name}
                onChange={e => onNameChange(e.target.value)}
                placeholder="예: Apple Inc."
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent focus:bg-white transition-all pr-24"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${nameStatus.includes('발견') ? 'text-accent-dark' : 'text-gray-400'}`}>{nameStatus}</span>
            </div>

            {results.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl mb-3 max-h-44 overflow-y-auto">
                {results.map(r => (
                  <div
                    key={r.sym}
                    onClick={() => selectResult(r.sym, r.name)}
                    className="flex justify-between items-center px-4 py-2.5 cursor-pointer hover:bg-white border-b border-gray-200 last:border-b-0 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-sm">{r.sym}</span>
                      <span className="text-xs text-gray-400 ml-2">{r.name}</span>
                    </div>
                    <span className="text-xs text-accent-dark">선택 →</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 hover:border-gray-300 transition-all">취소</button>
              <button onClick={confirmAdd} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-accent transition-all">추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
