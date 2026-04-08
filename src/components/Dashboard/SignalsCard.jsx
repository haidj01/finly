import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { placeOrder } from '../../api/alpaca'
import OrderModal from '../shared/OrderModal'

const SIGNALS = [
  { type: 'buy',  sym: 'NVDA', reason: 'RSI 과매도 반등 + 어닝 서프라이즈 기대', conf: '신뢰도 87%' },
  { type: 'buy',  sym: 'META', reason: 'Golden Cross + AI 광고 수익 개선',        conf: '신뢰도 82%' },
  { type: 'hold', sym: 'AAPL', reason: '200일선 지지 확인 중, 관망 권고',           conf: '신뢰도 75%' },
  { type: 'sell', sym: 'TSLA', reason: '지지선 이탈 + 거래량 감소세',              conf: '신뢰도 71%' },
]

const TAG = {
  buy:  'bg-accent-light text-accent-dark',
  sell: 'bg-red-50 text-red-500',
  hold: 'bg-yellow-50 text-yellow-500',
}

export default function SignalsCard() {
  const { watchlist, alpacaKey } = useStore()
  const [order, setOrder] = useState(null)

  const getPrice = (sym) => watchlist.find(w => w.sym === sym)?.price || 100

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">AI Signals</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">Claude</span>
      </div>
      <div className="space-y-2.5">
        {SIGNALS.map(s => (
          <div key={s.sym} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-accent transition-all cursor-pointer group">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5 ${TAG[s.type]}`}>
              {s.type.toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">{s.sym}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.reason}</div>
              <div className="text-xs text-gray-300 mt-1">{s.conf}</div>
            </div>
            {s.type !== 'hold' && alpacaKey && (
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
