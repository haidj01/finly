import React from 'react'
import { useStore } from '../../store/useStore'
import { useAlpacaRefresh } from '../../hooks/useAlpacaRefresh'

const COLORS = ['#00c805','#0066ff','#7c3aed','#f59e0b','#ec4899','#14b8a6','#f97316','#06b6d4']

const ORDER_STATUS = {
  new:               { label: '접수중',   cls: 'bg-blue-50 text-blue-500' },
  pending_new:       { label: '접수대기', cls: 'bg-blue-50 text-blue-400' },
  accepted:          { label: '수락됨',   cls: 'bg-blue-50 text-blue-400' },
  held:              { label: '보류중',   cls: 'bg-yellow-50 text-yellow-500' },
  partially_filled:  { label: '부분체결', cls: 'bg-yellow-50 text-yellow-600' },
  filled:            { label: '체결완료', cls: 'bg-accent-light text-accent-dark' },
  done_for_day:      { label: '당일종료', cls: 'bg-gray-100 text-gray-500' },
  canceled:          { label: '취소됨',   cls: 'bg-red-50 text-red-400' },
  pending_cancel:    { label: '취소중',   cls: 'bg-red-50 text-red-300' },
  expired:           { label: '만료됨',   cls: 'bg-gray-100 text-gray-400' },
  replaced:          { label: '수정됨',   cls: 'bg-gray-100 text-gray-400' },
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (diff < 60)   return `${diff}분 전`
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`
  return `${Math.floor(diff / 1440)}일 전`
}

export default function PortfolioCard() {
  const { alpacaAccount, positions, orders } = useStore()
  const { refresh } = useAlpacaRefresh()

  const equity    = alpacaAccount ? parseFloat(alpacaAccount.equity) : 0
  const lastEq    = alpacaAccount ? parseFloat(alpacaAccount.last_equity) : 0
  const cash      = alpacaAccount ? parseFloat(alpacaAccount.cash) : 0
  const dayPnl    = equity - lastEq
  const dayPct    = lastEq ? (dayPnl / lastEq * 100) : 0
  const totalPnl  = positions.reduce((s, p) => s + parseFloat(p.unrealized_pl), 0)
  const totalCost = positions.reduce((s, p) => s + parseFloat(p.cost_basis), 0)
  const totalPct  = totalCost ? (totalPnl / totalCost * 100) : 0
  const totalMv   = positions.reduce((s, p) => s + parseFloat(p.market_value), 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">Portfolio</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-light text-accent-dark">Alpaca Live</span>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-accent hover:text-accent-dark transition-all"
          >↻ 새로고침</button>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
            {positions.length} Holdings
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-5 mb-4 text-white">
        <div className="text-xs opacity-50 uppercase tracking-wide mb-1">Alpaca Paper · Total Equity</div>
        <div className="text-3xl font-bold tracking-tight mb-3">
          ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex gap-6 flex-wrap">
          {[
            { lbl: '오늘 P&L',    val: `${dayPnl >= 0 ? '+' : ''}$${dayPnl.toFixed(2)}`,     up: dayPnl >= 0 },
            { lbl: '오늘 수익률', val: `${dayPct >= 0 ? '+' : ''}${dayPct.toFixed(2)}%`,      up: dayPct >= 0 },
            { lbl: '미실현 손익', val: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,  up: totalPnl >= 0 },
            { lbl: '총 수익률',   val: `${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(2)}%`,  up: totalPct >= 0 },
            { lbl: 'Cash',        val: `$${(cash / 1000).toFixed(1)}K`, up: true },
          ].map(s => (
            <div key={s.lbl}>
              <div className="text-xs opacity-50">{s.lbl}</div>
              <div className={`text-sm font-semibold ${s.up ? 'text-green-400' : 'text-red-400'}`}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alloc bar */}
      {positions.length > 0 && (
        <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-4">
          {positions.map((p, i) => {
            const pct = totalMv ? parseFloat(p.market_value) / totalMv * 100 : 0
            return <div key={p.symbol} className="rounded-sm" style={{ flex: pct, background: COLORS[i % COLORS.length] }} title={`${p.symbol} ${pct.toFixed(1)}%`} />
          })}
        </div>
      )}

      {/* Holdings */}
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Holdings</div>
      {positions.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-3">보유 포지션이 없습니다.</div>
      ) : (
        <div className="divide-y divide-gray-100 mb-6">
          {positions.map((p, i) => {
            const mv  = parseFloat(p.market_value)
            const pl  = parseFloat(p.unrealized_pl)
            const plp = parseFloat(p.unrealized_plpc) * 100
            const qty = parseFloat(p.qty)
            const avg = parseFloat(p.avg_entry_price)
            const cur = parseFloat(p.current_price)
            const c   = COLORS[i % COLORS.length]
            return (
              <div key={p.symbol} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                  {p.symbol.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{p.symbol}</div>
                  <div className="text-xs text-gray-400">{qty}주 · 평균 ${avg.toFixed(2)} → ${cur.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">${mv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`text-xs font-semibold ${pl >= 0 ? 'text-accent-dark' : 'text-red-500'}`}>
                    {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({plp >= 0 ? '+' : ''}{plp.toFixed(1)}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Orders */}
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
        주문 내역 <span className="font-normal normal-case text-gray-300">최근 {orders.length}건</span>
      </div>
      {orders.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-3">주문 내역이 없습니다.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map(o => {
            const isBuy      = o.side === 'buy'
            const statusInfo = ORDER_STATUS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-400' }
            const filledQty  = parseFloat(o.filled_qty || 0)
            const filledAvg  = parseFloat(o.filled_avg_price || 0)
            const orderedQty = parseFloat(o.qty || 0)
            return (
              <div key={o.id} className="flex items-center gap-3 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isBuy ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-500'}`}>
                  {isBuy ? '매수' : '매도'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{o.symbol}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {o.status === 'filled'
                      ? `${filledQty}주 · 체결가 $${filledAvg.toFixed(2)} · ${timeAgo(o.filled_at)}`
                      : `${orderedQty}주 · 시장가 · ${timeAgo(o.submitted_at)}`
                    }
                  </div>
                </div>
                <div className="text-right">
                  {o.status === 'filled' && filledAvg > 0 && (
                    <>
                      <div className="text-sm font-bold">
                        ${(filledQty * filledAvg).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-400">총 체결금액</div>
                    </>
                  )}
                  {o.status !== 'filled' && (
                    <div className="text-xs text-gray-400">{timeAgo(o.submitted_at)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
