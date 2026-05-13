import React, { useState, useEffect } from 'react'
import { fetchTradingMode, setTradingMode } from '../../api/strategy'

export default function TradingModeSwitch() {
  const [mode, setMode]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError]     = useState(null)

  const load = async () => {
    try {
      const data = await fetchTradingMode()
      setMode(data.mode)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = () => {
    if (mode === 'paper') {
      setConfirm(true)
    } else {
      apply('paper')
    }
  }

  const apply = async (target) => {
    setConfirm(false)
    setLoading(true)
    setError(null)
    try {
      const data = await setTradingMode(target)
      setMode(data.mode)
    } catch (e) {
      setError(e.message || '모드 변경 실패')
    }
    setLoading(false)
  }

  const isLive = mode === 'live'

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">거래 모드</h2>
        {mode && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isLive
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {isLive ? '실거래' : '모의거래'}
          </span>
        )}
      </div>

      {mode === null && !error && (
        <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">{error}</div>
      )}

      {mode !== null && (
        <div className="space-y-4">
          <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
            isLive
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <span className="text-2xl">{isLive ? '💰' : '📄'}</span>
            <div className="flex-1">
              <div className={`text-sm font-bold ${isLive ? 'text-red-600' : 'text-blue-600'}`}>
                {isLive ? 'Live Account' : 'Paper Account'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {isLive ? 'api.alpaca.markets' : 'paper-api.alpaca.markets'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
              isLive
                ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            }`}
          >
            {loading
              ? '전환 중...'
              : isLive
                ? '모의거래로 전환'
                : '실거래로 전환'}
          </button>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <div className="text-lg font-bold mb-2 text-red-600">실거래 전환 확인</div>
            <p className="text-sm text-gray-600 mb-4">
              실계좌로 전환하면 <span className="font-semibold text-red-600">실제 자금</span>으로 거래됩니다.
              자동매매 전략이 즉시 실거래에 적용됩니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={() => apply('live')}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all"
              >
                실거래 전환
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
