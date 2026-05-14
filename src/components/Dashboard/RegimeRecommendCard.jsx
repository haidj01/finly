import React, { useState, useEffect } from 'react'
import { fetchRegimeRecommendations } from '../../api/strategy'

const TYPE_LABEL = {
  stop_loss:     'Stop Loss',
  take_profit:   'Take Profit',
  trailing_stop: 'Trailing Stop',
  price_target:  '목표가',
  rsi_threshold: 'RSI',
  ma_cross:      'MA 크로스',
  bollinger_band: 'Bollinger',
}

const TYPE_CLS = {
  stop_loss:     'bg-red-50 text-red-500',
  take_profit:   'bg-green-50 text-green-600',
  trailing_stop: 'bg-orange-50 text-orange-500',
  price_target:  'bg-blue-50 text-blue-500',
  rsi_threshold: 'bg-purple-50 text-purple-500',
  ma_cross:      'bg-indigo-50 text-indigo-500',
  bollinger_band: 'bg-teal-50 text-teal-600',
}

const REGIME_STYLE = {
  bearish:  'bg-red-50 text-red-600 border-red-200',
  volatile: 'bg-orange-50 text-orange-600 border-orange-200',
  trending: 'bg-green-50 text-green-600 border-green-200',
  ranging:  'bg-gray-50 text-gray-600 border-gray-200',
}

const REGIME_ICON = { bearish: '🐻', volatile: '⚡', trending: '🚀', ranging: '↔️' }

export default function RegimeRecommendCard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchRegimeRecommendations())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const regime = data?.regime || 'ranging'
  const regimeCls = REGIME_STYLE[regime] || REGIME_STYLE.ranging

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sm:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">AI 전략 추천</h2>
          {data && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${regimeCls}`}>
              {REGIME_ICON[regime]} {data.regime_label}
            </span>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-accent hover:text-accent-dark transition-all disabled:opacity-40"
        >
          {loading ? '분석 중...' : '↻ 새로고침'}
        </button>
      </div>

      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-6">{error}</div>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_CLS[rec.type] || 'bg-gray-100 text-gray-500'}`}>
                  {TYPE_LABEL[rec.type] || rec.type}
                </span>
                <span className="text-xs font-bold text-gray-700">{rec.symbol}</span>
              </div>
              <div className="text-xs font-semibold text-gray-800 leading-snug">{rec.name}</div>
              <div className="text-[11px] text-gray-500 leading-relaxed flex-1">{rec.reason}</div>
              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {rec.allowed_regimes?.map(r => {
                  const meta = { bearish: '하락', volatile: '변동', trending: '추세', ranging: '횡보' }
                  return (
                    <span key={r} className="px-1.5 py-0 rounded-full text-[10px] font-medium bg-purple-50 text-purple-500">
                      {meta[r] ?? r}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
