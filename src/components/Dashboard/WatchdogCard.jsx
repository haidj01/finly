import React, { useState, useEffect } from 'react'
import { fetchWatchdogStatus, updateWatchdogConfig } from '../../api/strategy'

export default function WatchdogCard() {
  const [config, setConfig]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const load = async () => {
    try {
      const data = await fetchWatchdogStatus()
      setConfig(data.config)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const toggle = async () => {
    if (!config || loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await updateWatchdogConfig({ ...config, enabled: !config.enabled })
      setConfig(data.config)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const isOn = config?.enabled === true

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">워치독</h2>
        {config && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isOn
              ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'bg-gray-100 text-gray-400 border border-gray-200'
          }`}>
            {isOn ? '활성' : '비활성'}
          </span>
        )}
      </div>

      {config === null && !error && (
        <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">{error}</div>
      )}

      {config && (
        <div className="space-y-3">
          <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
            isOn ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <span className="text-2xl">{isOn ? '🐕' : '😴'}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold ${isOn ? 'text-orange-600' : 'text-gray-400'}`}>
                {isOn ? '손실 감지 중' : '감지 중지됨'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex gap-3">
                <span>손실 임계 <span className="font-semibold text-gray-600">{config.drop_pct}%</span></span>
                <span>최대 {config.max_sell_qty}주</span>
              </div>
            </div>
          </div>

          <button
            onClick={toggle}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
              isOn
                ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            {loading ? '처리 중...' : isOn ? '워치독 비활성화' : '워치독 활성화'}
          </button>
        </div>
      )}
    </div>
  )
}
