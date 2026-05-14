import React, { useState, useEffect, useCallback } from 'react'
import { fetchTradeHistory } from '../../api/strategy'

const STATUS_META = {
  executed: { label: '체결', cls: 'bg-green-50 text-green-600' },
  failed:   { label: '실패', cls: 'bg-red-50 text-red-500' },
  skipped:  { label: '스킵', cls: 'bg-gray-100 text-gray-400' },
}

const TYPE_META = {
  stop_loss:    { label: '손절', cls: 'bg-red-50 text-red-500' },
  take_profit:  { label: '익절', cls: 'bg-green-50 text-green-600' },
  price_target: { label: '목표가', cls: 'bg-blue-50 text-blue-500' },
  watchdog:     { label: '워치독', cls: 'bg-orange-50 text-orange-500' },
}

const SIDE_META = {
  buy:  { label: '매수', cls: 'text-accent-dark font-semibold' },
  sell: { label: '매도', cls: 'text-red-500 font-semibold' },
}

const STATUS_FILTERS = [
  { key: '', label: '전체' },
  { key: 'executed', label: '체결' },
  { key: 'failed', label: '실패' },
  { key: 'skipped', label: '스킵' },
]

const MODE_TABS = [
  { key: '', label: '전체' },
  { key: 'paper', label: 'Paper' },
  { key: 'live', label: 'Live' },
]

const PAGE_SIZE = 50

function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function TradeHistory() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [modeFilter, setModeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [symbolInput, setSymbolInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (newOffset, newMode, newStatus, newSymbol) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTradeHistory({ limit: PAGE_SIZE, offset: newOffset, mode: newMode, status: newStatus, symbol: newSymbol })
      if (newOffset === 0) {
        setItems(data.items)
      } else {
        setItems(prev => [...prev, ...data.items])
      }
      setTotal(data.total)
      setOffset(newOffset)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(0, modeFilter, statusFilter, symbolFilter)
  }, [modeFilter, statusFilter, symbolFilter, load])

  const handleStatusFilter = (key) => {
    setStatusFilter(key)
  }

  const handleSymbolSearch = (e) => {
    e.preventDefault()
    setSymbolFilter(symbolInput.trim().toUpperCase())
  }

  const handleLoadMore = () => {
    load(offset + PAGE_SIZE, modeFilter, statusFilter, symbolFilter)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">매매 이력</h2>
          <span className="text-sm text-gray-400">총 {total.toLocaleString()}건</span>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-3 w-fit">
          {MODE_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setModeFilter(t.key)}
              className={`px-5 py-1.5 rounded-[9px] text-sm font-semibold transition-all ${
                modeFilter === t.key
                  ? t.key === 'live'
                    ? 'bg-white text-red-500 shadow-sm'
                    : t.key === 'paper'
                    ? 'bg-white text-blue-500 shadow-sm'
                    : 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => handleStatusFilter(f.key)}
                className={`px-4 py-1.5 rounded-[9px] text-sm font-medium transition-all ${
                  statusFilter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSymbolSearch} className="flex gap-2">
            <input
              type="text"
              value={symbolInput}
              onChange={e => setSymbolInput(e.target.value)}
              placeholder="종목 검색 (예: AAPL)"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
            >
              검색
            </button>
            {symbolFilter && (
              <button
                type="button"
                onClick={() => { setSymbolFilter(''); setSymbolInput('') }}
                className="px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">시간</th>
                  <th className="text-left px-4 py-3">종목</th>
                  <th className="text-left px-4 py-3">전략</th>
                  <th className="text-left px-4 py-3">타입</th>
                  <th className="text-left px-4 py-3">구분</th>
                  <th className="text-right px-4 py-3">수량</th>
                  <th className="text-left px-4 py-3">상태</th>
                  <th className="text-left px-4 py-3">사유</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const statusMeta = STATUS_META[item.status] || { label: item.status, cls: 'bg-gray-100 text-gray-500' }
                  const typeMeta = TYPE_META[item.strategy_type] || { label: item.strategy_type || '-', cls: 'bg-gray-100 text-gray-400' }
                  const sideMeta = SIDE_META[item.side] || { label: item.side, cls: 'text-gray-500' }
                  return (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap font-mono">{formatTime(item.time)}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{item.symbol}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{item.strategy_name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeMeta.cls}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${sideMeta.cls}`}>{sideMeta.label}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.qty ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.cls}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" title={item.error || item.reason}>
                        {item.error ? (
                          <span className="text-red-400">{item.error}</span>
                        ) : (
                          item.reason || '-'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {items.map(item => {
              const statusMeta = STATUS_META[item.status] || { label: item.status, cls: 'bg-gray-100 text-gray-500' }
              const typeMeta = TYPE_META[item.strategy_type] || { label: item.strategy_type || '-', cls: 'bg-gray-100 text-gray-400' }
              const sideMeta = SIDE_META[item.side] || { label: item.side, cls: 'text-gray-500' }
              return (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.symbol}</span>
                      <span className={`text-sm ${sideMeta.cls}`}>{sideMeta.label}</span>
                      {item.qty && <span className="text-sm text-gray-500">{item.qty}주</span>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeMeta.cls}`}>{typeMeta.label}</span>
                    <span className="text-xs text-gray-500">{item.strategy_name || '-'}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{formatTime(item.time)}</div>
                  {(item.error || item.reason) && (
                    <div className={`text-xs mt-1 ${item.error ? 'text-red-400' : 'text-gray-400'}`}>
                      {item.error || item.reason}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Empty / loading / error */}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">매매 이력이 없습니다.</div>
          )}
          {error && (
            <div className="text-center py-16 text-red-400 text-sm">{error}</div>
          )}
          {loading && items.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
          )}
        </div>

        {/* Load more */}
        {items.length < total && (
          <div className="mt-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              {loading ? '불러오는 중...' : `더 보기 (${total - items.length}건 남음)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
