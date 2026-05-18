import React, { useState, useEffect } from 'react'
import { fetchEngineStatus, updateEngineConfig } from '../../api/strategy'

const MODE_LABEL = { paper: 'Paper', live: 'Live' }
const MODE_COLOR = {
  paper: { on: 'bg-blue-50 border-blue-200', badge: 'bg-blue-50 text-blue-600 border border-blue-200', btn_off: 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100', btn_on: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200', text: 'text-blue-600' },
  live:  { on: 'bg-green-50 border-green-200', badge: 'bg-green-50 text-green-600 border border-green-200', btn_off: 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100', btn_on: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200', text: 'text-green-600' },
}

export default function StrategyEngineCard() {
  const [config, setConfig]   = useState(null)
  const [loading, setLoading] = useState({})
  const [error, setError]     = useState(null)

  const load = async () => {
    try {
      const data = await fetchEngineStatus()
      setConfig(data.config)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const toggle = async (mode) => {
    if (!config || loading[mode]) return
    setLoading(l => ({ ...l, [mode]: true }))
    setError(null)
    try {
      const data = await updateEngineConfig(mode, !config[mode].enabled)
      setConfig(data.config)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(l => ({ ...l, [mode]: false }))
    }
  }

  const anyOn = config && (config.paper?.enabled || config.live?.enabled)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">전략 엔진</h2>
        {config && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            anyOn
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-gray-100 text-gray-400 border border-gray-200'
          }`}>
            {anyOn ? '활성' : '비활성'}
          </span>
        )}
      </div>

      {config === null && !error && (
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">{error}</div>
      )}

      {config && (
        <div className="space-y-3">
          {['paper', 'live'].map((mode) => {
            const mc = config[mode] ?? { enabled: true }
            const isOn = mc.enabled === true
            const colors = MODE_COLOR[mode]
            return (
              <div key={mode} className={`rounded-xl border p-3 ${isOn ? colors.on : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{isOn ? '⚙️' : '⏸️'}</span>
                    <span className={`text-sm font-bold ${isOn ? colors.text : 'text-gray-400'}`}>
                      {MODE_LABEL[mode]}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isOn ? colors.badge : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    {isOn ? '실행 중' : '일시정지'}
                  </span>
                </div>
                <button
                  onClick={() => toggle(mode)}
                  disabled={!!loading[mode]}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${
                    isOn ? colors.btn_on : colors.btn_off
                  }`}
                >
                  {loading[mode] ? '처리 중...' : isOn ? '일시정지' : '재개'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
