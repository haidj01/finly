import React, { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useStore } from '../../store/useStore'
import { fetchSnapshot, fetchBars, fetchAsset, fetchNews, placeOrder } from '../../api/alpaca'
import { fetchStrategies, createStrategy, toggleStrategy, deleteStrategy } from '../../api/strategy'

const STRATEGY_TYPES = [
  { value: 'stop_loss',     label: 'Stop Loss' },
  { value: 'take_profit',   label: 'Take Profit' },
  { value: 'price_target',  label: '목표가' },
]

function fmt(n, digits = 2) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function StockDetail() {
  const { selectedSymbol, setSelectedSymbol, watchlist, addWatch, removeWatch, positions } = useStore()

  const [input, setInput] = useState(selectedSymbol || '')
  const [sym, setSym] = useState(selectedSymbol || '')

  const [snap, setSnap]       = useState(null)
  const [bars, setBars]       = useState([])
  const [news, setNews]       = useState([])
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Order state
  const [orderSide, setOrderSide] = useState('buy')
  const [orderQty, setOrderQty]   = useState(1)
  const [orderMsg, setOrderMsg]   = useState(null)

  // Strategy form
  const [showForm, setShowForm]     = useState(false)
  const [stratType, setStratType]   = useState('stop_loss')
  const [stratPrice, setStratPrice] = useState('')
  const [stratMsg, setStratMsg]     = useState(null)

  const inWatchlist = watchlist.some(w => w.sym === sym)
  const position    = positions.find(p => p.symbol === sym)

  const load = useCallback(async (s) => {
    if (!s) return
    setLoading(true)
    setError(null)
    try {
      const [snapData, barsData, newsData, stratData] = await Promise.all([
        fetchSnapshot(s),
        fetchBars(s, 60),
        fetchNews([s]).catch(() => []),
        fetchStrategies().catch(() => []),
      ])
      setSnap(snapData)
      setBars(barsData.map(b => ({ date: fmtDate(b.t), close: +b.c.toFixed(2) })))
      setNews(newsData.slice(0, 5))
      setStrategies(stratData.filter(st => st.symbol === s))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sym) load(sym)
  }, [sym, load])

  function handleSearch(e) {
    e.preventDefault()
    const s = input.trim().toUpperCase()
    if (!s) return
    setSym(s)
    setSelectedSymbol(s)
  }

  function handleWatchToggle() {
    if (inWatchlist) {
      removeWatch(sym)
    } else {
      const dp = snap?.dailyBar
      addWatch({
        sym,
        co: sym,
        price: dp?.c ?? 0,
        chg: 0,
        up: true,
      })
    }
  }

  async function handleOrder() {
    setOrderMsg(null)
    try {
      await placeOrder({ symbol: sym, qty: orderQty, side: orderSide })
      setOrderMsg({ ok: true, text: `${orderSide === 'buy' ? '매수' : '매도'} 주문 완료` })
    } catch (e) {
      setOrderMsg({ ok: false, text: e.message })
    }
  }

  async function handleStratCreate(e) {
    e.preventDefault()
    setStratMsg(null)
    try {
      const created = await createStrategy({
        symbol: sym,
        strategy_type: stratType,
        price: parseFloat(stratPrice),
      })
      setStrategies(prev => [...prev, created])
      setStratPrice('')
      setShowForm(false)
      setStratMsg({ ok: true, text: '전략이 추가되었습니다.' })
    } catch (e) {
      setStratMsg({ ok: false, text: e.message })
    }
  }

  async function handleToggle(sid) {
    try {
      const updated = await toggleStrategy(sid)
      setStrategies(prev => prev.map(s => s.id === sid ? updated : s))
    } catch {}
  }

  async function handleDelete(sid) {
    try {
      await deleteStrategy(sid)
      setStrategies(prev => prev.filter(s => s.id !== sid))
    } catch {}
  }

  const latestPrice = snap?.latestTrade?.p ?? snap?.dailyBar?.c
  const db = snap?.dailyBar
  const prevClose = snap?.prevDailyBar?.c
  const dayChange = latestPrice && prevClose ? latestPrice - prevClose : null
  const dayChangePct = dayChange && prevClose ? (dayChange / prevClose) * 100 : null
  const isUp = dayChange >= 0

  return (
    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="티커 입력 (예: AAPL)"
          className="flex-1 max-w-xs border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          조회
        </button>
      </form>

      {!sym && (
        <div className="text-center text-gray-400 mt-20 text-sm">종목 티커를 입력하세요.</div>
      )}

      {sym && loading && (
        <div className="text-center text-gray-400 mt-20 text-sm">로딩 중…</div>
      )}

      {sym && error && (
        <div className="text-center text-red-400 mt-20 text-sm">{error}</div>
      )}

      {sym && !loading && snap && (
        <div className="grid grid-cols-2 gap-4">

          {/* ── Price Card ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold">{sym}</span>
                  <button
                    onClick={handleWatchToggle}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      inWatchlist
                        ? 'bg-accent-light text-accent-dark'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {inWatchlist ? '★ Watchlist' : '☆ Watchlist 추가'}
                  </button>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold">${fmt(latestPrice)}</span>
                  {dayChange != null && (
                    <span className={`text-lg font-semibold ${isUp ? 'text-accent-dark' : 'text-red-500'}`}>
                      {isUp ? '+' : ''}{fmt(dayChange)} ({isUp ? '+' : ''}{fmt(dayChangePct)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* OHLCV stats */}
              {db && (
                <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-right text-sm">
                  {[
                    ['시가', db.o], ['고가', db.h], ['저가', db.l],
                    ['거래량', db.v ? db.v.toLocaleString() : '—', true],
                    ['전일 종가', prevClose],
                  ].map(([label, val, raw]) => (
                    <div key={label}>
                      <div className="text-[10px] text-gray-400 uppercase">{label}</div>
                      <div className="font-semibold">{raw ? val : val ? `$${fmt(val)}` : '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Chart ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2">
            <div className="text-sm font-semibold text-gray-700 mb-3">60일 주가 차트</div>
            {bars.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={bars} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={55} />
                  <Tooltip formatter={v => [`$${fmt(v)}`, '종가']} labelStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="close" stroke="#16a34a" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400">차트 데이터 없음</div>
            )}
          </div>

          {/* ── Position & Order ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-sm font-semibold text-gray-700 mb-3">포지션 & 주문</div>

            {position ? (
              <div className="mb-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">보유 수량</span>
                  <span className="font-semibold">{position.qty}주</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">평균 단가</span>
                  <span className="font-semibold">${fmt(position.avg_entry_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">평가손익</span>
                  <span className={`font-semibold ${+position.unrealized_pl >= 0 ? 'text-accent-dark' : 'text-red-500'}`}>
                    {+position.unrealized_pl >= 0 ? '+' : ''}${fmt(position.unrealized_pl)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4">미보유 종목</p>
            )}

            <div className="flex gap-2 mb-3">
              {['buy', 'sell'].map(side => (
                <button
                  key={side}
                  onClick={() => setOrderSide(side)}
                  className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    orderSide === side
                      ? side === 'buy' ? 'bg-accent text-white' : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {side === 'buy' ? '매수' : '매도'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs text-gray-500 w-10">수량</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={orderQty}
                onChange={e => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <button
              onClick={handleOrder}
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                orderSide === 'buy'
                  ? 'bg-accent text-white hover:bg-accent-dark'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {orderSide === 'buy' ? '매수 주문' : '매도 주문'}
            </button>

            {orderMsg && (
              <p className={`text-xs mt-2 text-center ${orderMsg.ok ? 'text-accent-dark' : 'text-red-500'}`}>
                {orderMsg.text}
              </p>
            )}
          </div>

          {/* ── Strategy ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">전략 설정</div>
              <button
                onClick={() => setShowForm(f => !f)}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showForm ? '닫기' : '+ 추가'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleStratCreate} className="mb-4 space-y-2">
                <select
                  value={stratType}
                  onChange={e => setStratType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {STRATEGY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="가격 (USD)"
                    value={stratPrice}
                    onChange={e => setStratPrice(e.target.value)}
                    required
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors"
                  >
                    저장
                  </button>
                </div>
              </form>
            )}

            {stratMsg && (
              <p className={`text-xs mb-2 ${stratMsg.ok ? 'text-accent-dark' : 'text-red-500'}`}>
                {stratMsg.text}
              </p>
            )}

            {strategies.length === 0 ? (
              <p className="text-xs text-gray-400">등록된 전략 없음</p>
            ) : (
              <div className="space-y-2">
                {strategies.map(st => (
                  <div key={st.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <div>
                      <div className="text-xs font-semibold text-gray-700">
                        {STRATEGY_TYPES.find(t => t.value === st.strategy_type)?.label ?? st.strategy_type}
                      </div>
                      <div className="text-[11px] text-gray-400">${fmt(st.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(st.id)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                          st.enabled
                            ? 'bg-accent-light text-accent-dark'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {st.enabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => handleDelete(st.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── News ──────────────────────────────────────────── */}
          {news.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-2">
              <div className="text-sm font-semibold text-gray-700 mb-3">관련 뉴스</div>
              <div className="space-y-3">
                {news.map((n, i) => (
                  <a
                    key={i}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 group"
                  >
                    {n.images?.[0]?.url && (
                      <img
                        src={n.images[0].url}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-800 group-hover:text-accent-dark line-clamp-2 transition-colors">
                        {n.headline}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {n.source} · {fmtDate(n.created_at)}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
