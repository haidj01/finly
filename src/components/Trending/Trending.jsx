import React, { useState, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { fetchLatestPrices, placeOrder } from '../../api/alpaca'
import OrderModal from '../shared/OrderModal'
import { apiFetch } from '../../api/client'

async function fetchTrending() {
  const res = await apiFetch('/api/trending')
  if (!res.ok) throw new Error(`오류 ${res.status}`)
  return res.json()
}

const CATEGORY = {
  most_active: { label: '거래량 급등', cls: 'bg-blue-50 text-blue-500' },
  gainer:      { label: '상승 상위',   cls: 'bg-accent-light text-accent-dark' },
  loser:       { label: '하락 상위',   cls: 'bg-red-50 text-red-500' },
}

const SECTION = [
  { key: 'actives', title: '거래량 급등',   icon: '🔥', desc: '오늘 거래량이 가장 많은 종목' },
  { key: 'gainers', title: '상승 상위',     icon: '📈', desc: '당일 등락률 상위 종목' },
  { key: 'losers',  title: '하락 상위',     icon: '📉', desc: '당일 하락률 상위 종목' },
]

function StockCard({ stock, onOrder }) {
  const { addWatch, watchlist } = useStore()
  const isWatching = watchlist.some(w => w.sym === stock.sym)
  const isUp = stock.chg_pct >= 0

  const handleAddWatch = () => {
    if (isWatching) return
    addWatch({ sym: stock.sym, co: stock.sym, price: stock.price, chg: stock.change, up: isUp })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-accent hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
            {stock.sym.slice(0, 3)}
          </div>
          <div>
            <div className="text-sm font-bold">{stock.sym}</div>
            <div className="text-xs text-gray-400">${stock.price.toFixed(2)}</div>
          </div>
        </div>
        <div className={`text-sm font-bold ${isUp ? 'text-accent-dark' : 'text-red-500'}`}>
          {isUp ? '+' : ''}{stock.chg_pct.toFixed(2)}%
        </div>
      </div>

      {stock.reason && (
        <div className="text-xs text-gray-500 mb-3 leading-relaxed border-l-2 border-gray-200 pl-2">
          {stock.reason}
        </div>
      )}
      {!stock.reason && (
        <div className="h-4 bg-gray-100 rounded animate-pulse mb-3" />
      )}

      <div className="text-xs text-gray-300 mb-3">
        거래량 {stock.volume > 0 ? (stock.volume / 1_000_000).toFixed(1) + 'M' : '-'}
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={handleAddWatch}
          disabled={isWatching}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:border-accent hover:text-accent-dark transition-all disabled:opacity-40 disabled:cursor-default"
        >
          {isWatching ? '관심 등록됨' : '+ 관심종목'}
        </button>
        <button
          onClick={() => onOrder({ sym: stock.sym, side: 'buy', price: stock.price })}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-accent transition-all"
        >
          매수
        </button>
      </div>
    </div>
  )
}

function SectionBlock({ section, stocks, loading, onOrder }) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{section.icon}</span>
          <div>
            <div className="text-sm font-bold">{section.title}</div>
            <div className="text-xs text-gray-400">{section.desc}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{section.icon}</span>
        <div>
          <div className="text-sm font-bold">{section.title}</div>
          <div className="text-xs text-gray-400">{section.desc}</div>
        </div>
        <span className="text-xs text-gray-300 ml-1">{stocks.length}종목</span>
      </div>
      {stocks.length === 0 ? (
        <div className="text-sm text-gray-400 py-4 text-center">데이터가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {stocks.map(s => <StockCard key={s.sym} stock={s} onOrder={onOrder} />)}
        </div>
      )}
    </div>
  )
}

export default function Trending() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [order, setOrder]   = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTrending()
      setData(result)
      setLastUpdated(new Date())
    } catch (e) {
      console.error('[Trending]', e)
      setError(e.message || '데이터 로딩 실패')
    }
    setLoading(false)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">주목 종목</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Alpaca 실시간 데이터 + Claude AI 분석
            {lastUpdated && ` · 업데이트 ${lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-accent transition-all disabled:opacity-40"
        >
          <span>{loading ? '분석 중...' : '↻ 분석 시작'}</span>
        </button>
      </div>

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <div className="text-5xl">🔍</div>
          <div>
            <div className="text-base font-bold text-gray-700 mb-1">주목 종목 분석</div>
            <div className="text-sm text-gray-400">
              오늘 시장에서 주목받는 종목을<br />Alpaca 데이터와 Claude AI로 분석합니다.
            </div>
          </div>
          <button
            onClick={load}
            className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-accent transition-all"
          >
            분석 시작
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm mb-4">
          🚫 {error}
        </div>
      )}

      {/* Sections */}
      {(data || loading) && (
        <div className="flex flex-col gap-8">
          {SECTION.map(sec => (
            <SectionBlock
              key={sec.key}
              section={sec}
              stocks={data?.[sec.key] || []}
              loading={loading}
              onOrder={setOrder}
            />
          ))}
        </div>
      )}

      {order && <OrderModal order={order} onClose={() => setOrder(null)} />}
    </div>
  )
}
