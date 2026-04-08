import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { placeOrder } from '../../api/alpaca'

export default function OrderModal({ order, onClose }) {
  const { alpacaKey, alpacaSecret } = useStore()
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const total = (qty * order.price).toFixed(2)
  const isBuy = order.side === 'buy'

  const execute = async () => {
    setLoading(true)
    try {
      await placeOrder(alpacaKey, alpacaSecret, { symbol: order.sym, qty, side: order.side })
      setStatus({ ok: true, msg: `✅ ${order.sym} ${qty}주 ${isBuy ? '매수' : '매도'} 주문이 접수됐습니다!` })
    } catch (e) {
      setStatus({ ok: false, msg: `❌ 오류: ${e.message}` })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-7 w-80 shadow-xl">
        <div className="text-2xl font-bold tracking-tight">{order.sym}</div>
        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mt-1 mb-5 ${isBuy ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-500'}`}>
          {isBuy ? '매수 (BUY)' : '매도 (SELL)'}
        </span>

        <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3">
          <span className="text-sm text-gray-400">현재가</span>
          <span className="text-lg font-bold">${order.price}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium">수량</span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center font-mono font-bold text-lg bg-gray-50 border-2 border-gray-200 rounded-xl py-2 outline-none focus:border-accent"
          />
          <span className="text-sm text-gray-400">주</span>
        </div>

        <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm text-gray-400">예상 금액</span>
          <span className="text-xl font-bold">${total}</span>
        </div>

        {status && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${status.ok ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-500'}`}>
            {status.msg}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 hover:border-gray-300 transition-all">
            {status ? '닫기' : '취소'}
          </button>
          {!status && (
            <button
              onClick={execute}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 ${isBuy ? 'bg-accent hover:bg-accent-dark' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {loading ? '처리 중...' : `${isBuy ? '매수' : '매도'} 실행`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
