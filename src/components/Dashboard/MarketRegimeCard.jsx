import React, { useState, useEffect } from 'react'
import { fetchMarketRegime } from '../../api/strategy'

const REGIME_STYLE = {
  bearish:  { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    bar: 'bg-red-400'    },
  volatile: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', bar: 'bg-orange-400' },
  trending: { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  bar: 'bg-green-400'  },
  ranging:  { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   bar: 'bg-gray-400'   },
}

const REGIME_ICON = {
  bearish:  '🐻',
  volatile: '⚡',
  trending: '🚀',
  ranging:  '↔️',
}

const MA_CROSS_LABEL = { golden: '골든크로스', dead: '데드크로스', neutral: '중립' }
const MA_CROSS_CLS   = { golden: 'text-green-600', dead: 'text-red-500', neutral: 'text-gray-400' }

const RSI_LABEL = {
  overbought: '과매수',
  bullish:    '강세',
  bearish:    '약세',
  oversold:   '과매도',
  neutral:    '중립',
}
const RSI_CLS = {
  overbought: 'text-red-500',
  bullish:    'text-green-600',
  bearish:    'text-red-400',
  oversold:   'text-red-600',
  neutral:    'text-gray-400',
}

function SizeBar({ factor }) {
  const pct = Math.round(factor * 100)
  const regime = factor >= 1.0 ? 'trending' : factor >= 0.75 ? 'ranging' : factor >= 0.5 ? 'volatile' : 'bearish'
  const { bar } = REGIME_STYLE[regime]
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function MarketRegimeCard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchMarketRegime())
    } catch (e) {
      setError(e.message || '조회 실패')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const regime  = data?.regime || 'ranging'
  const style   = REGIME_STYLE[regime]
  const details = data?.details || {}
  const signals = details.signals || {}

  const updatedAt = data?.updated_at
    ? new Date(data.updated_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">시장 국면</h2>
        <div className="flex items-center gap-2">
          {updatedAt && <span className="text-[10px] text-gray-300">{updatedAt} 기준</span>}
          <button
            onClick={load}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-accent hover:text-accent-dark transition-all disabled:opacity-40"
          >
            {loading ? '조회 중...' : '↻ 새로고침'}
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="space-y-3">
          <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">{error}</div>
      )}

      {data && (
        <div className="space-y-3">
          {/* 국면 배지 */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border}`}>
            <span className="text-2xl">{REGIME_ICON[regime]}</span>
            <div className="flex-1">
              <div className={`text-base font-bold ${style.text}`}>{data.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">SPY ${details.price?.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">포지션 사이징</div>
              <div className={`text-sm font-bold ${style.text}`}>{Math.round(data.size_factor * 100)}%</div>
            </div>
          </div>

          {/* 사이징 바 */}
          <SizeBar factor={data.size_factor} />

          {/* 지표 그리드 */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-[10px] text-gray-400 mb-0.5">RSI(14)</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">{details.rsi14?.toFixed(1) ?? '—'}</span>
                {signals.rsi_zone && (
                  <span className={`text-[10px] font-medium ${RSI_CLS[signals.rsi_zone] || 'text-gray-400'}`}>
                    {RSI_LABEL[signals.rsi_zone]}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-[10px] text-gray-400 mb-0.5">MA 크로스</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  {details.ma5?.toFixed(0) ?? '—'} / {details.ma20?.toFixed(0) ?? '—'}
                </span>
                {signals.ma_cross && (
                  <span className={`text-[10px] font-medium ${MA_CROSS_CLS[signals.ma_cross] || 'text-gray-400'}`}>
                    {MA_CROSS_LABEL[signals.ma_cross]}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-[10px] text-gray-400 mb-0.5">BB 폭 (변동성)</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">{details.bb_width_pct?.toFixed(1) ?? '—'}%</span>
                <span className={`text-[10px] font-medium ${signals.volatility === 'high' ? 'text-orange-500' : 'text-gray-400'}`}>
                  {signals.volatility === 'high' ? '고변동성' : '정상'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-[10px] text-gray-400 mb-0.5">가격 vs MA20</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">${details.ma20?.toFixed(0) ?? '—'}</span>
                <span className={`text-[10px] font-medium ${signals.price_vs_ma20 === 'above' ? 'text-green-600' : 'text-red-400'}`}>
                  {signals.price_vs_ma20 === 'above' ? '상회' : '하회'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
