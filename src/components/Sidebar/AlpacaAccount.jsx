import React from 'react'
import { useStore } from '../../store/useStore'
import { useAlpacaRefresh } from '../../hooks/useAlpacaRefresh'

export default function AlpacaAccount() {
  const { alpacaAccount, tradingMode } = useStore()
  const { refresh } = useAlpacaRefresh()
  const isLive = tradingMode === 'live'

  const equity = alpacaAccount ? parseFloat(alpacaAccount.equity) : 0
  const lastEq = alpacaAccount ? parseFloat(alpacaAccount.last_equity) : 0
  const cash   = alpacaAccount ? parseFloat(alpacaAccount.cash) : 0
  const buyPow = alpacaAccount ? parseFloat(alpacaAccount.buying_power) : 0
  const dayPnl = equity - lastEq
  const dayPct = lastEq ? (dayPnl / lastEq * 100) : 0

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Alpaca Account</span>
        <button
          onClick={refresh}
          className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:border-accent hover:text-accent hover:bg-accent-light transition-all text-sm"
        >↻</button>
      </div>

      {!alpacaAccount ? (
        <div className="text-xs text-gray-400 py-2">로딩 중...</div>
      ) : (
        <>
          <div className={`bg-gradient-to-br rounded-xl p-4 text-white mb-2 ${isLive ? 'from-red-900 to-red-700' : 'from-gray-900 to-gray-700'}`}>
            <div className="text-xs opacity-50 uppercase tracking-wide mb-1">
              {isLive ? 'Live Account Equity' : 'Paper Account Equity'}
            </div>
            <div className="text-2xl font-bold tracking-tight mb-2">
              ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs opacity-50">오늘 P&L</div>
                <div className={`text-sm font-semibold ${dayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dayPnl >= 0 ? '+' : ''}${dayPnl.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-50">수익률</div>
                <div className={`text-sm font-semibold ${dayPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dayPct >= 0 ? '+' : ''}{dayPct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cash</div>
              <div className="text-sm font-bold">${(cash / 1000).toFixed(1)}K</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">구매력</div>
              <div className="text-sm font-bold">${(buyPow / 1000).toFixed(1)}K</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
