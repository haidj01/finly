import React, { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useStore } from '../../store/useStore'
import { fetchSnapshot, fetchBars, fetchAsset, fetchNews, placeOrder } from '../../api/alpaca'
import { fetchStrategies, createStrategy, toggleStrategy, deleteStrategy, fetchTradeHistory, fetchTradingMode, fetchRegimeRecommendations } from '../../api/strategy'

const STRATEGY_TYPES = [
  { value: 'stop_loss',     label: 'Stop Loss' },
  { value: 'take_profit',   label: 'Take Profit' },
  { value: 'price_target',  label: '목표가' },
  { value: 'trailing_stop', label: 'Trailing Stop' },
  { value: 'rsi_threshold', label: 'RSI' },
  { value: 'ma_cross',      label: 'MA 크로스' },
  { value: 'bollinger_band', label: 'Bollinger Band' },
]

function fmt(n, digits = 2) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

const PERIODS = [
  { key: '1D', label: '1일' },
  { key: '1W', label: '1주' },
  { key: '1M', label: '1개월' },
  { key: '1Y', label: '1년' },
]

function fmtDate(iso, period) {
  if (!iso) return ''
  const d = new Date(iso)
  if (period === '1D') {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })
  }
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function StockDetail() {
  const { selectedSymbol, setSelectedSymbol, watchlist, addWatch, removeWatch, positions } = useStore()

  const [input, setInput] = useState(selectedSymbol || '')
  const [sym, setSym] = useState(selectedSymbol || '')

  const [snap, setSnap]       = useState(null)
  const [bars, setBars]       = useState([])
  const [news, setNews]       = useState([])
  const [strategies, setStrategies] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const [tradeTotal, setTradeTotal]     = useState(0)
  const [tradeOffset, setTradeOffset]   = useState(0)
  const [histLoading, setHistLoading]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Order state
  const [period, setPeriod] = useState('1M')

  // Order state
  const [orderSide, setOrderSide] = useState('buy')
  const [orderQty, setOrderQty]   = useState(1)
  const [orderMsg, setOrderMsg]   = useState(null)

  // Strategy mode tab
  const [stratMode, setStratMode] = useState('paper')

  // Strategy form
  const [showForm, setShowForm]   = useState(false)
  const [stratType, setStratType] = useState('stop_loss')
  const [stratVal, setStratVal]   = useState('')        // drop_pct / gain_pct / target_price
  const [stratDir, setStratDir]   = useState('above')  // price_target direction
  const [stratSide, setStratSide] = useState('buy')     // price_target action side
  const [stratQty, setStratQty]       = useState(1)     // price_target / rsi qty
  const [stratRsiPeriod, setStratRsiPeriod] = useState(14)
  const [stratMaFast, setStratMaFast]           = useState(5)
  const [stratMaSlow, setStratMaSlow]           = useState(20)
  const [stratBbPeriod, setStratBbPeriod]       = useState(20)
  const [stratBbMultiplier, setStratBbMultiplier] = useState(2.0)
  const [stratAllowedRegimes, setStratAllowedRegimes] = useState([])

  // Recommendations
  const [recData, setRecData]       = useState(null)
  const [recLoading, setRecLoading] = useState(false)
  const [recOpen, setRecOpen]       = useState(false)
  const [stratMsg, setStratMsg]                 = useState(null)

  const REGIME_OPTIONS = [
    { key: 'bearish',  label: '하락장' },
    { key: 'volatile', label: '변동장' },
    { key: 'trending', label: '추세장' },
    { key: 'ranging',  label: '횡보장' },
  ]

  const toggleRegime = (key) => {
    setStratAllowedRegimes(prev =>
      prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
    )
  }

  const loadRecommendations = async (s) => {
    if (!s) return
    setRecLoading(true)
    try {
      setRecData(await fetchRegimeRecommendations(s))
      setRecOpen(true)
    } catch {}
    finally { setRecLoading(false) }
  }

  const applyRecommendation = (rec) => {
    setStratType(rec.type)
    setStratAllowedRegimes(rec.allowed_regimes || [])
    const c = rec.condition
    const a = rec.action
    if (rec.type === 'stop_loss')       setStratVal(String(c.drop_pct ?? ''))
    else if (rec.type === 'take_profit') setStratVal(String(c.gain_pct ?? ''))
    else if (rec.type === 'trailing_stop') setStratVal(String(c.trail_pct ?? ''))
    else if (rec.type === 'price_target') {
      setStratVal(String(c.target_price ?? ''))
      setStratDir(c.direction || 'above')
      setStratSide(a.side || 'buy')
      setStratQty(a.qty || 1)
    } else if (rec.type === 'rsi_threshold') {
      setStratRsiPeriod(c.period || 14)
      setStratVal(String(c.threshold ?? ''))
      setStratDir(c.direction || 'below')
      setStratQty(a.qty || 1)
    } else if (rec.type === 'ma_cross') {
      setStratMaFast(c.fast || 5)
      setStratMaSlow(c.slow || 20)
      setStratDir(c.direction || 'golden')
    } else if (rec.type === 'bollinger_band') {
      setStratBbPeriod(c.period || 20)
      setStratBbMultiplier(c.multiplier || 2.0)
      setStratDir(c.direction || 'below_lower')
      setStratQty(a.qty || 1)
    }
    setShowForm(true)
  }

  const inWatchlist = watchlist.some(w => w.sym === sym)
  const position    = positions.find(p => p.symbol === sym)

  const load = useCallback(async (s) => {
    if (!s) return
    setLoading(true)
    setError(null)
    try {
      const [snapData, newsData, histData] = await Promise.all([
        fetchSnapshot(s),
        fetchNews([s]).catch(() => []),
        fetchTradeHistory({ limit: 20, symbol: s }).catch(() => ({ items: [] })),
      ])
      setSnap(snapData)
      const allNews = [
        ...(newsData?.alpaca?.items ?? []),
        ...(newsData?.google?.items ?? []),
      ].sort((a, b) => (b.time > a.time ? 1 : -1)).slice(0, 5)
      setNews(allNews)
      setTradeHistory(histData.items ?? [])
      setTradeTotal(histData.total ?? 0)
      setTradeOffset(histData.items?.length ?? 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStrategies = useCallback(async (s, mode) => {
    if (!s) return
    try {
      const data = await fetchStrategies(mode)
      setStrategies(data.filter(st => st.symbol === s))
    } catch {}
  }, [])

  const loadBars = useCallback(async (s, p) => {
    if (!s) return
    try {
      const barsData = await fetchBars(s, p)
      setBars((barsData || []).map(b => ({ date: fmtDate(b.t, p), close: +b.c.toFixed(2) })))
    } catch {
      setBars([])
    }
  }, [])

  const loadMoreHistory = useCallback(async () => {
    if (!sym || histLoading) return
    setHistLoading(true)
    try {
      const data = await fetchTradeHistory({ limit: 20, offset: tradeOffset, symbol: sym })
      setTradeHistory(prev => [...prev, ...(data.items ?? [])])
      setTradeTotal(data.total ?? 0)
      setTradeOffset(prev => prev + (data.items?.length ?? 0))
    } catch {}
    finally { setHistLoading(false) }
  }, [sym, tradeOffset, histLoading])

  useEffect(() => {
    fetchTradingMode().then(d => setStratMode(d.mode)).catch(() => {})
  }, [])

  useEffect(() => {
    if (sym) load(sym)
  }, [sym, load])

  useEffect(() => {
    if (sym) loadStrategies(sym, stratMode)
  }, [sym, stratMode, loadStrategies])

  useEffect(() => {
    if (sym) loadBars(sym, period)
  }, [sym, period, loadBars])

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
    const val = parseFloat(stratVal)

    let condition, action, name
    if (stratType === 'stop_loss') {
      condition = { drop_pct: val }
      action    = { side: 'sell', qty_type: 'all' }
      name      = `${sym} Stop Loss ${val}%`
    } else if (stratType === 'take_profit') {
      condition = { gain_pct: val }
      action    = { side: 'sell', qty_type: 'all' }
      name      = `${sym} Take Profit ${val}%`
    } else if (stratType === 'trailing_stop') {
      condition = { trail_pct: val }
      action    = { side: 'sell', qty_type: 'all' }
      name      = `${sym} Trailing Stop ${val}%`
    } else if (stratType === 'rsi_threshold') {
      const side = stratDir === 'below' ? 'buy' : 'sell'
      condition = { period: stratRsiPeriod, threshold: val, direction: stratDir }
      action    = { side, qty: stratQty, qty_type: 'shares' }
      name      = `${sym} RSI(${stratRsiPeriod}) ${stratDir === 'below' ? '<' : '>'}${val}`
    } else if (stratType === 'ma_cross') {
      const side    = stratDir === 'golden' ? 'buy' : 'sell'
      const qtyType = stratDir === 'golden' ? 'shares' : 'all'
      condition = { fast: stratMaFast, slow: stratMaSlow, direction: stratDir }
      action    = { side, qty: stratDir === 'golden' ? stratQty : undefined, qty_type: qtyType }
      name      = `${sym} MA${stratMaFast}/MA${stratMaSlow} ${stratDir === 'golden' ? '골든' : '데드'}크로스`
    } else if (stratType === 'bollinger_band') {
      const side    = stratDir === 'below_lower' ? 'buy' : 'sell'
      const qtyType = stratDir === 'below_lower' ? 'shares' : 'all'
      condition = { period: stratBbPeriod, multiplier: stratBbMultiplier, direction: stratDir }
      action    = { side, qty: stratDir === 'below_lower' ? stratQty : undefined, qty_type: qtyType }
      name      = `${sym} BB(${stratBbPeriod},${stratBbMultiplier}σ) ${stratDir === 'below_lower' ? '하단' : '상단'}`
    } else {
      condition = { target_price: val, direction: stratDir }
      action    = { side: stratSide, qty: stratQty, qty_type: 'shares' }
      name      = `${sym} ${stratDir === 'above' ? '↑' : '↓'}$${val} ${stratSide}`
    }

    try {
      const allowed_regimes = stratAllowedRegimes.length > 0 ? stratAllowedRegimes : null
      const res = await createStrategy({ name, symbol: sym, type: stratType, condition, action, account_mode: stratMode, allowed_regimes })
      setStrategies(prev => [...prev, res.strategy])
      setStratVal('')
      setStratAllowedRegimes([])
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
    <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 md:mb-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* ── Price Card ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">주가 차트</div>
              <div className="flex gap-1">
                {PERIODS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                      period === p.key
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
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
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">전략 설정</div>
                <div className="flex gap-1">
                  {['paper', 'live'].map(m => (
                    <button
                      key={m}
                      onClick={() => { setStratMode(m); setShowForm(false) }}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                        stratMode === m
                          ? m === 'live'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {m === 'paper' ? '📄 Paper' : '💰 Live'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => recData ? setRecOpen(o => !o) : loadRecommendations(sym)}
                  disabled={recLoading}
                  className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-40"
                >
                  {recLoading ? '분석 중...' : recOpen ? '추천 닫기' : '✨ AI 추천'}
                </button>
                <button
                  onClick={() => setShowForm(f => !f)}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showForm ? '닫기' : '+ 추가'}
                </button>
              </div>
            </div>

            {/* AI 추천 패널 */}
            {recOpen && recData && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">현재 국면: <span className="font-semibold text-gray-600">{recData.regime_label}</span></span>
                  <button
                    onClick={() => loadRecommendations(sym)}
                    disabled={recLoading}
                    className="text-[10px] text-gray-400 hover:text-accent transition-colors disabled:opacity-40"
                  >
                    ↻ 다시 분석
                  </button>
                </div>
                {recData.recommendations.map((rec, i) => {
                  const TYPE_LABEL = { stop_loss: 'Stop Loss', take_profit: 'Take Profit', trailing_stop: 'Trailing Stop', price_target: '목표가', rsi_threshold: 'RSI', ma_cross: 'MA 크로스', bollinger_band: 'Bollinger' }
                  const TYPE_CLS   = { stop_loss: 'bg-red-50 text-red-500', take_profit: 'bg-green-50 text-green-600', trailing_stop: 'bg-orange-50 text-orange-500', price_target: 'bg-blue-50 text-blue-500', rsi_threshold: 'bg-purple-50 text-purple-500', ma_cross: 'bg-indigo-50 text-indigo-500', bollinger_band: 'bg-teal-50 text-teal-600' }
                  return (
                    <div key={i} className="border border-purple-100 rounded-xl p-3 bg-purple-50/30 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0 rounded-full ${TYPE_CLS[rec.type] || 'bg-gray-100 text-gray-500'}`}>
                            {TYPE_LABEL[rec.type] || rec.type}
                          </span>
                          <span className="text-[10px] font-bold text-gray-600">{rec.symbol}</span>
                        </div>
                        <div className="text-xs font-semibold text-gray-700 mb-0.5">{rec.name}</div>
                        <div className="text-[11px] text-gray-500 leading-relaxed">{rec.reason}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyRecommendation(rec)}
                        className="flex-shrink-0 text-[11px] px-2.5 py-1 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                      >
                        적용
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {showForm && (
              <form onSubmit={handleStratCreate} className="mb-4 space-y-2">
                <select
                  value={stratType}
                  onChange={e => { setStratType(e.target.value); setStratVal('') }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {STRATEGY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {stratType === 'stop_loss' && (
                  <input type="number" step="0.1" min="0.1" placeholder="손실 임계값 (%)" value={stratVal}
                    onChange={e => setStratVal(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                )}
                {stratType === 'take_profit' && (
                  <input type="number" step="0.1" min="0.1" placeholder="수익 목표 (%)" value={stratVal}
                    onChange={e => setStratVal(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                )}
                {stratType === 'trailing_stop' && (
                  <input type="number" step="0.1" min="0.1" placeholder="추적 손절 기준 (%)" value={stratVal}
                    onChange={e => setStratVal(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                )}
                {stratType === 'rsi_threshold' && (
                  <>
                    <div className="flex gap-2">
                      <input type="number" min="2" max="50" value={stratRsiPeriod}
                        onChange={e => setStratRsiPeriod(parseInt(e.target.value) || 14)}
                        className="w-20 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                        title="RSI 기간" />
                      <input type="number" step="1" min="1" max="99" placeholder="임계값 (예: 30)" value={stratVal}
                        onChange={e => setStratVal(e.target.value)} required
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      <select value={stratDir} onChange={e => setStratDir(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                        <option value="below">이하 → 매수</option>
                        <option value="above">이상 → 매도</option>
                      </select>
                    </div>
                    <input type="number" min="1" max="10000" value={stratQty}
                      onChange={e => setStratQty(parseInt(e.target.value) || 1)}
                      placeholder="수량"
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </>
                )}
                {stratType === 'ma_cross' && (
                  <>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 pl-1">빠른 MA</label>
                        <input type="number" min="2" max="50" value={stratMaFast}
                          onChange={e => setStratMaFast(parseInt(e.target.value) || 5)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 pl-1">느린 MA</label>
                        <input type="number" min="3" max="200" value={stratMaSlow}
                          onChange={e => setStratMaSlow(parseInt(e.target.value) || 20)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                    </div>
                    <select value={stratDir} onChange={e => setStratDir(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                      <option value="golden">골든크로스 → 매수</option>
                      <option value="dead">데드크로스 → 전량 매도</option>
                    </select>
                    {stratDir === 'golden' && (
                      <input type="number" min="1" max="10000" value={stratQty}
                        onChange={e => setStratQty(parseInt(e.target.value) || 1)}
                        placeholder="매수 수량"
                        className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    )}
                  </>
                )}
                {stratType === 'bollinger_band' && (
                  <>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 pl-1">기간</label>
                        <input type="number" min="5" max="100" value={stratBbPeriod}
                          onChange={e => setStratBbPeriod(parseInt(e.target.value) || 20)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 pl-1">표준편차 배수</label>
                        <input type="number" min="0.5" max="4" step="0.5" value={stratBbMultiplier}
                          onChange={e => setStratBbMultiplier(parseFloat(e.target.value) || 2.0)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                      </div>
                    </div>
                    <select value={stratDir} onChange={e => setStratDir(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                      <option value="below_lower">하단밴드 이하 → 매수 (과매도)</option>
                      <option value="above_upper">상단밴드 이상 → 전량 매도 (과매수)</option>
                    </select>
                    {stratDir === 'below_lower' && (
                      <input type="number" min="1" max="10000" value={stratQty}
                        onChange={e => setStratQty(parseInt(e.target.value) || 1)}
                        placeholder="매수 수량"
                        className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    )}
                  </>
                )}
                {stratType === 'price_target' && (
                  <>
                    <input type="number" step="0.01" min="0.01" placeholder="목표 가격 (USD)" value={stratVal}
                      onChange={e => setStratVal(e.target.value)} required
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    <div className="flex gap-2">
                      <select value={stratDir} onChange={e => setStratDir(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                        <option value="above">이상 (above)</option>
                        <option value="below">이하 (below)</option>
                      </select>
                      <select value={stratSide} onChange={e => setStratSide(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                        <option value="buy">매수</option>
                        <option value="sell">매도</option>
                      </select>
                      <input type="number" min="1" max="10000" value={stratQty}
                        onChange={e => setStratQty(parseInt(e.target.value) || 1)}
                        className="w-16 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    </div>
                  </>
                )}

                {/* B: 허용 시장 국면 선택 (선택 안 하면 모든 국면에서 실행) */}
                <div className="border border-gray-100 rounded-xl px-3 py-2 bg-gray-50">
                  <p className="text-[10px] text-gray-400 mb-1.5">허용 시장 국면 <span className="text-gray-300">(미선택 시 전체)</span></p>
                  <div className="flex gap-3 flex-wrap">
                    {REGIME_OPTIONS.map(r => (
                      <label key={r.key} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stratAllowedRegimes.includes(r.key)}
                          onChange={() => toggleRegime(r.key)}
                          className="accent-accent"
                        />
                        <span className="text-xs text-gray-600">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit"
                  className="w-full py-1.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors">
                  저장
                </button>
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
                      <div className="text-xs font-semibold text-gray-700">{st.name}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                        {STRATEGY_TYPES.find(t => t.value === st.type)?.label ?? st.type}
                        <span className={`px-1.5 py-0 rounded-full text-[10px] font-medium ${
                          st.account_mode === 'live'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {st.account_mode === 'live' ? 'Live' : 'Paper'}
                        </span>
                        {st.allowed_regimes?.map(r => {
                          const meta = { bearish: '하락', volatile: '변동', trending: '추세', ranging: '횡보' }
                          return (
                            <span key={r} className="px-1.5 py-0 rounded-full text-[10px] font-medium bg-purple-50 text-purple-500">
                              {meta[r] ?? r}
                            </span>
                          )
                        })}
                      </div>
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

          {/* ── Trade History ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">매매 이력</div>
              {tradeTotal > 0 && <span className="text-xs text-gray-400">총 {tradeTotal}건</span>}
            </div>
            {tradeHistory.length === 0 ? (
              <p className="text-xs text-gray-400">매매 이력 없음</p>
            ) : (
              <>
                <div className="space-y-2">
                  {tradeHistory.map(item => {
                    const isExec = item.status === 'executed'
                    const isFail = item.status === 'failed'
                    const isBuy  = item.side === 'buy'
                    const d = new Date(item.time)
                    const pad = n => String(n).padStart(2, '0')
                    const timeStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-semibold flex-shrink-0 ${isBuy ? 'text-accent-dark' : 'text-red-500'}`}>
                            {isBuy ? '매수' : '매도'}
                          </span>
                          {item.qty != null && <span className="text-gray-500 flex-shrink-0">{item.qty}주</span>}
                          <span className="text-xs text-gray-400 truncate">{item.strategy_name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-400 font-mono hidden sm:inline">{timeStr}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isExec ? 'bg-green-50 text-green-600' :
                            isFail ? 'bg-red-50 text-red-500' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {isExec ? '체결' : isFail ? '실패' : '스킵'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {tradeHistory.length < tradeTotal && (
                  <button
                    onClick={loadMoreHistory}
                    disabled={histLoading}
                    className="mt-3 w-full py-1.5 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    {histLoading ? '불러오는 중...' : `더 보기 (${tradeTotal - tradeHistory.length}건 남음)`}
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── News ──────────────────────────────────────────── */}
          {news.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 col-span-full">
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
                    <div>
                      <div className="text-sm font-medium text-gray-800 group-hover:text-accent-dark line-clamp-2 transition-colors">
                        {n.hl_ko || n.hl}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {n.source} · {fmtDate(n.time)}
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
