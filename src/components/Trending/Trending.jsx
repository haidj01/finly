import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { fetchAsset } from '../../api/alpaca'
import OrderModal from '../shared/OrderModal'
import { apiFetch } from '../../api/client'

const LOADING_MESSAGES = [
  '시장 데이터 수집 중...',
  'AI 분석 중...',
  '결과 정리 중...',
]

async function fetchTrending() {
  const res = await apiFetch('/api/trending')
  if (!res.ok) throw new Error(`오류 ${res.status}`)
  return res.json()
}

const ANALYST_CLS = {
  '매수': 'text-accent-dark',
  '중립': 'text-yellow-600',
  '매도': 'text-red-500',
}

const CONFIDENCE_CLS = {
  3: 'bg-green-50 text-green-600',
  2: 'bg-yellow-50 text-yellow-600',
  1: 'bg-gray-100 text-gray-400',
}
const CONFIDENCE_LABEL = {
  3: '근거 명확',
  2: '간접 근거',
  1: '추측성',
}

const CATEGORY_BADGE = {
  most_active: { label: '거래량급등', cls: 'bg-orange-50 text-orange-500' },
  gainer:      { label: '상승',       cls: 'bg-green-50 text-green-600' },
  loser:       { label: '하락반등',   cls: 'bg-blue-50 text-blue-500' },
}

function StockCard({ stock, onOrder }) {
  const { addWatch, watchlist, positions } = useStore()
  const isWatching = watchlist.some(w => w.sym === stock.sym)
  const isHolding  = positions.some(p => p.symbol === stock.sym)
  const isUp = stock.chg_pct >= 0

  const handleAddWatch = async () => {
    if (isWatching) return
    const asset = await fetchAsset(stock.sym)
    addWatch({ sym: stock.sym, co: asset?.name || stock.sym, price: stock.price, chg: stock.chg_pct, up: isUp })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-accent hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
            {stock.sym.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div className="text-sm font-bold">{stock.sym}</div>
              {isHolding && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-semibold">보유</span>
              )}
              {CATEGORY_BADGE[stock.category] && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${CATEGORY_BADGE[stock.category].cls}`}>
                  {CATEGORY_BADGE[stock.category].label}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">${stock.price.toFixed(2)}</div>
          </div>
        </div>
        <div className={`text-sm font-bold ${isUp ? 'text-accent-dark' : 'text-red-500'}`}>
          {isUp ? '+' : ''}{stock.chg_pct.toFixed(2)}%
        </div>
      </div>

      <div className="text-xs mb-3 leading-relaxed space-y-1">
        <div className="border-l-2 border-gray-200 pl-2">
          {stock.reason
            ? <span className="text-gray-500">{stock.reason}</span>
            : <span className="text-gray-300">-</span>
          }
        </div>
        {stock.risk && (
          <div className="border-l-2 border-red-200 pl-2">
            <span className="text-red-400">⚠ {stock.risk}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {stock.confidence != null && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CONFIDENCE_CLS[stock.confidence] || 'bg-gray-100 text-gray-400'}`}>
            {CONFIDENCE_LABEL[stock.confidence] || '추측성'}
          </span>
        )}
        {stock.pe != null && stock.sector_pe != null ? (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stock.pe > stock.sector_pe ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
            PER {stock.pe} vs 업종 {stock.sector_pe}
          </span>
        ) : stock.pe != null ? (
          <span className="text-[10px] text-gray-400">PER {stock.pe}</span>
        ) : null}
        {stock.analyst && (
          <span className={`text-[10px] font-semibold ${ANALYST_CLS[stock.analyst] || 'text-gray-400'}`}>{stock.analyst}</span>
        )}
        {stock.growth && (
          <span className="text-[10px] text-gray-400">성장 {stock.growth}</span>
        )}
        {stock.confidence == null && stock.pe == null && !stock.analyst && !stock.growth && (
          <span className="text-[10px] text-gray-300">거래량 {stock.volume > 0 ? (stock.volume / 1_000_000).toFixed(1) + 'M' : '-'}</span>
        )}
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


export default function Trending() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [order, setOrder]     = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  const messageRef   = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (messageRef.current) clearInterval(messageRef.current)
    }
  }, [])

  // 로딩 메시지 순환
  useEffect(() => {
    if (!loading) return
    let index = 0
    messageRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setLoadingMessage(LOADING_MESSAGES[index % LOADING_MESSAGES.length])
        index++
      }
    }, 800)
    return () => clearInterval(messageRef.current)
  }, [loading])

  const load = async () => {
    if (!isMountedRef.current || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTrending()
      if (!isMountedRef.current) return
      setData(result)
      setLastUpdated(new Date())
    } catch (e) {
      if (!isMountedRef.current) return
      console.error('[Trending]', e)
      setError(e.message || '데이터 로딩 실패')
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">매수 추천 종목</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Alpaca 실시간 데이터 + Claude AI 선별
            {lastUpdated && ` · 업데이트 ${lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-accent transition-all disabled:opacity-40"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⟳</span>
              <span>{loadingMessage}</span>
            </>
          ) : (
            <span>↻ 분석 시작</span>
          )}
        </button>
      </div>

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <div className="text-5xl">🔍</div>
          <div>
            <div className="text-base font-bold text-gray-700 mb-1">매수 추천 종목 분석</div>
            <div className="text-sm text-gray-400">
              오늘 시장에서 매수를 고려할 만한 종목을<br />Alpaca 데이터와 Claude AI로 선별합니다.
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

      {/* Picks grid */}
      {loading && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}
      {data && !loading && (
        data.picks.length === 0 ? (
          <div className="text-sm text-gray-400 py-10 text-center">
            오늘 매수 추천 종목이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {data.picks.map(s => <StockCard key={s.sym} stock={s} onOrder={setOrder} />)}
          </div>
        )
      )}

      {order && <OrderModal order={order} onClose={() => setOrder(null)} />}
    </div>
  )
}
