import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { fetchLatestPrices, placeOrder, fetchAsset } from '../../api/alpaca'
import OrderModal from '../shared/OrderModal'
import { apiFetch } from '../../api/client'

// 동적 로딩 메시지 순환
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

// 현재 시각이 미국 주식시장 장중인지 판단 (EST/EDT 기준)
function isMarketHours() {
  const now = new Date()
  // UTC → EST/EDT 변환 (EST = UTC-5, EDT = UTC-4)
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const hours = estTime.getHours()
  const minutes = estTime.getMinutes()
  const day = estTime.getDay()

  // 월-금 09:30-16:00
  if (day === 0 || day === 6) return false
  if (hours < 9 || hours >= 16) return false
  if (hours === 9 && minutes < 30) return false

  return true
}

const GRADE_CLS = {
  A: 'bg-green-50 text-green-600',
  B: 'bg-blue-50 text-blue-500',
  C: 'bg-yellow-50 text-yellow-600',
  D: 'bg-red-50 text-red-500',
}

const ANALYST_CLS = {
  '매수': 'text-accent-dark',
  '중립': 'text-yellow-600',
  '매도': 'text-red-500',
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
            </div>
            <div className="text-xs text-gray-400">${stock.price.toFixed(2)}</div>
          </div>
        </div>
        <div className={`text-sm font-bold ${isUp ? 'text-accent-dark' : 'text-red-500'}`}>
          {isUp ? '+' : ''}{stock.chg_pct.toFixed(2)}%
        </div>
      </div>

      <div className="text-xs mb-3 leading-relaxed border-l-2 border-gray-200 pl-2">
        {stock.reason
          ? <span className="text-gray-500">{stock.reason}</span>
          : <span className="text-gray-300">-</span>
        }
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {stock.grade && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${GRADE_CLS[stock.grade] || 'bg-gray-100 text-gray-400'}`}>
            {stock.grade}
          </span>
        )}
        {stock.pe != null && (
          <span className="text-[10px] text-gray-400">PER {stock.pe}</span>
        )}
        {stock.analyst && (
          <span className={`text-[10px] font-semibold ${ANALYST_CLS[stock.analyst] || 'text-gray-400'}`}>{stock.analyst}</span>
        )}
        {stock.growth && (
          <span className="text-[10px] text-gray-400">성장 {stock.growth}</span>
        )}
        {!stock.grade && stock.pe == null && !stock.analyst && !stock.growth && (
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

function SectionBlock({ section, stocks, loading, isBackgroundRefresh, onOrder }) {
  // 초기 로드일 때만 스켈레톤 표시, 백그라운드 갱신 시 이전 데이터 유지
  if (loading && !isBackgroundRefresh) {
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
    <div className={isBackgroundRefresh && loading ? 'opacity-60' : ''}>
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
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [nextRefreshIn, setNextRefreshIn] = useState(null)
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false)

  // 타이머 ref들 (cleanup 용도)
  const timerRef = useRef(null)
  const countdownRef = useRef(null)
  const messageRef = useRef(null)
  const isMountedRef = useRef(true)

  // load 함수: isBackground 플래그로 배경 갱신 구분
  const load = useCallback(async (isBackground = false) => {
    if (!isMountedRef.current) return

    setLoading(true)
    if (isBackground) setIsBackgroundRefresh(true)
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
      if (isMountedRef.current) {
        setLoading(false)
        setIsBackgroundRefresh(false)
      }
    }
  }, [])

  // 로딩 메시지 순환 (0.8초마다)
  useEffect(() => {
    if (!loading) return

    let index = 0
    messageRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setLoadingMessage(LOADING_MESSAGES[index % LOADING_MESSAGES.length])
        index++
      }
    }, 800)

    return () => {
      if (messageRef.current) clearInterval(messageRef.current)
    }
  }, [loading])

  // 카운트다운 타이머 (1초마다 업데이트)
  useEffect(() => {
    if (!nextRefreshIn) return

    countdownRef.current = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [nextRefreshIn])

  // 자동 갱신 스케줄러
  useEffect(() => {
    // 초기 진입 시 자동 로드
    load(false)

    // 갱신 스케줄 설정
    const scheduleNextRefresh = () => {
      const market = isMarketHours()
      const interval = market ? 5 * 60 : 30 * 60 // 장중 5분, 장외 30분

      setNextRefreshIn(interval)

      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          load(true)
          scheduleNextRefresh() // 재귀적으로 다음 갱신 스케줄
        }
      }, interval * 1000)
    }

    scheduleNextRefresh()

    // cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [load])

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (messageRef.current) clearInterval(messageRef.current)
    }
  }, [])

  // 카운트다운 포맷팅 (mm:ss 또는 hh:mm:ss)
  const formatCountdown = (seconds) => {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">주목 종목</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Alpaca 실시간 데이터 + Claude AI 분석
            {lastUpdated && ` · 업데이트 ${lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
            {nextRefreshIn && ` · 다음 갱신 ${formatCountdown(nextRefreshIn)}`}
          </p>
        </div>
        <button
          onClick={() => load(false)}
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
            <div className="text-base font-bold text-gray-700 mb-1">주목 종목 분석</div>
            <div className="text-sm text-gray-400">
              오늘 시장에서 주목받는 종목을<br />Alpaca 데이터와 Claude AI로 분석합니다.
            </div>
          </div>
          <button
            onClick={() => load(false)}
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
              isBackgroundRefresh={isBackgroundRefresh}
              onOrder={setOrder}
            />
          ))}
        </div>
      )}

      {order && <OrderModal order={order} onClose={() => setOrder(null)} />}
    </div>
  )
}
