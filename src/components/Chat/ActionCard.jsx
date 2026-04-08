import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import OrderModal from '../shared/OrderModal'

export default function ActionCard({ action }) {
  const { watchlist } = useStore()
  const [order, setOrder] = useState(null)
  const price = watchlist.find(w => w.sym === action.sym)?.price || 100

  return (
    <div className="ml-11 mt-2">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-bold">{action.sym}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${action.isBuy ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-500'}`}>
            {action.isBuy ? '매수 추천' : '매도 추천'}
          </span>
        </div>
        <div className="text-xs text-gray-400 mb-3">현재가 ${price.toFixed(2)} · Alpaca Paper Trading으로 즉시 주문 가능</div>
        <div className="flex gap-2">
          {action.isBuy && (
            <button
              onClick={() => setOrder({ sym: action.sym, side: 'buy', price })}
              className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-all"
            >🟢 매수 주문</button>
          )}
          {action.isSell && (
            <button
              onClick={() => setOrder({ sym: action.sym, side: 'sell', price })}
              className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
            >🔴 매도 주문</button>
          )}
          <button
            onClick={() => useStore.getState().setView('dashboard')}
            className="px-4 py-2 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-200 hover:border-accent hover:text-accent-dark transition-all"
          >포트폴리오 보기</button>
        </div>
      </div>
      {order && <OrderModal order={order} onClose={() => setOrder(null)} />}
    </div>
  )
}
