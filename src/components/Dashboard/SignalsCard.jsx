import React, { useState, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { fetchSignals } from '../../api/claude'
import OrderModal from '../shared/OrderModal'

const TAG = {
  buy:  'bg-accent-light text-accent-dark',
  sell: 'bg-red-50 text-red-500',
  hold: 'bg-yellow-50 text-yellow-500',
}

export default function SignalsCard() {
  const { watchlist } = useStore()
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  const getPrice = (sym) => watchlist.find(w => w.sym === sym)?.price || 0

  const load = useCallback(async () => {
    const symbols = watchlist.map(w => w.sym)
    if (!symbols.length) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSignals(symbols)
      setSignals(data)
    } catch (e) {
      console.error('[SignalsCard]', e)
      setError(e.message || '분석 실패')
    }
    setLoading(false)
  }, [watchlist])


  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">AI Signals</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">Claude</span>
          <button
            onClick={load}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-accent hover:text-accent-dark transition-all disabled:opacity-40"
          >
            {loading ? '분석 중...' : '↻ 새로고침'}
          </button>
        </div>
      </div>

      {loading && signals.length === 0 && (
        <div className="space-y-2.5">
          {[...Array(watchlist.length || 3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="text-sm text-red-400 text-center">{error}</div>
          <button
            onClick={load}
            className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-400 hover:border-red-400 transition-all"
          >
            ↻ 재시도
          </button>
        </div>
      )}

      {!loading && !error && signals.length === 0 && (
        <div className="text-sm text-gray-400 py-4 text-center">
          새로고침을 눌러 분석을 시작하세요.
        </div>
      )}

      <div className="space-y-2.5">
        {signals.map(s => (
          <div key={s.sym} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-accent transition-all">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5 ${TAG[s.type] || TAG.hold}`}>
              {(s.type || 'hold').toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">{s.sym}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.reason}</div>
              <div className="text-xs text-gray-300 mt-1">{s.conf}</div>
            </div>
            {s.type !== 'hold' && (
              <button
                onClick={() => setOrder({ sym: s.sym, side: s.type, price: getPrice(s.sym) })}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all ${
                  s.type === 'buy'
                    ? 'bg-accent text-white hover:bg-accent-dark'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {s.type === 'buy' ? '매수' : '매도'}
              </button>
            )}
          </div>
        ))}
      </div>

      {order && <OrderModal order={order} onClose={() => setOrder(null)} />}
    </div>
  )
}
