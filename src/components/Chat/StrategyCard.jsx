import React, { useState } from 'react'
import { createStrategy } from '../../api/strategy'

const TYPE_META = {
  stop_loss:    { label: '손절',  cls: 'bg-red-50 text-red-500',    icon: '🛡️' },
  take_profit:  { label: '익절',  cls: 'bg-green-50 text-green-600', icon: '🎯' },
  price_target: { label: '목표가', cls: 'bg-blue-50 text-blue-500',  icon: '📌' },
}

function conditionSummary(type, condition) {
  if (type === 'stop_loss')    return `손실 ${condition.drop_pct}% 이하 시 전량 매도`
  if (type === 'take_profit')  return `수익 ${condition.gain_pct}% 이상 시 전량 매도`
  if (type === 'price_target') {
    const dir = condition.direction === 'above' ? '이상' : '이하'
    return `$${condition.target_price} ${dir} 도달 시`
  }
  return ''
}

function StrategyItem({ strategy }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [errMsg, setErrMsg] = useState('')
  const meta = TYPE_META[strategy.type] || { label: strategy.type, cls: 'bg-gray-100 text-gray-500', icon: '⚙️' }

  const apply = async () => {
    setStatus('loading')
    setErrMsg('')
    try {
      await createStrategy({
        name:      strategy.name,
        symbol:    strategy.symbol,
        type:      strategy.type,
        condition: strategy.condition,
        action:    strategy.action,
        enabled:   true,
      })
      setStatus('done')
    } catch (e) {
      setErrMsg(e.message || '전략 등록 실패')
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.cls}`}>
            {meta.icon} {meta.label}
          </span>
          <span className="text-xs font-semibold text-gray-700">{strategy.symbol}</span>
        </div>
        <div className="text-xs text-gray-500 truncate">{conditionSummary(strategy.type, strategy.condition)}</div>
        {status === 'error' && <div className="text-xs text-red-400 mt-0.5">{errMsg}</div>}
      </div>

      {status === 'done' ? (
        <span className="text-xs text-green-600 font-medium flex-shrink-0">✓ 적용됨</span>
      ) : (
        <button
          onClick={apply}
          disabled={status === 'loading'}
          className="flex-shrink-0 text-xs px-3 py-1.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-40"
        >
          {status === 'loading' ? '...' : '전략 적용'}
        </button>
      )}
    </div>
  )
}

export default function StrategyCard({ strategies }) {
  const [allApplied, setAllApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  const applyAll = async () => {
    setApplying(true)
    try {
      await Promise.all(
        strategies.map(s =>
          createStrategy({ name: s.name, symbol: s.symbol, type: s.type, condition: s.condition, action: s.action, enabled: true })
        )
      )
      setAllApplied(true)
    } catch {}
    setApplying(false)
  }

  return (
    <div className="ml-11 mt-2">
      <div className="bg-white border border-accent/20 rounded-xl p-4 shadow-sm max-w-md">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-gray-700">⚡ AI 추천 전략</div>
          {strategies.length > 1 && !allApplied && (
            <button
              onClick={applyAll}
              disabled={applying}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-accent hover:text-white transition-colors disabled:opacity-40"
            >
              {applying ? '적용 중...' : '전체 적용'}
            </button>
          )}
          {allApplied && <span className="text-xs text-green-600 font-medium">✓ 전체 적용됨</span>}
        </div>
        <div>
          {strategies.map((s, i) => (
            <StrategyItem key={i} strategy={allApplied ? { ...s, _applied: true } : s} />
          ))}
        </div>
        <div className="mt-2 text-[10px] text-gray-300">종목 조회 탭에서 전략을 확인·수정할 수 있습니다</div>
      </div>
    </div>
  )
}
