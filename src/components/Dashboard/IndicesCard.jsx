import React from 'react'

const INDICES = [
  { name: 'S&P 500', val: '5,248.32', chg: '+0.64%', up: true,  color: '#00c805' },
  { name: 'NASDAQ',  val: '16,442.10',chg: '+1.02%', up: true,  color: '#0066ff' },
  { name: 'DOW',     val: '39,127.54',chg: '+0.18%', up: true,  color: '#7c3aed' },
  { name: 'VIX',     val: '14.82',    chg: '-3.21%', up: false, color: '#f59e0b' },
]

export default function IndicesCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">Market Indices</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-light text-accent-dark">Live</span>
      </div>
      <div className="divide-y divide-gray-100">
        {INDICES.map(idx => (
          <div key={idx.name} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: idx.color }} />
              <span className="text-sm text-gray-500 font-medium">{idx.name}</span>
            </div>
            <span className="text-base font-bold">{idx.val}</span>
            <span className={`text-sm font-semibold ${idx.up ? 'text-accent-dark' : 'text-red-500'}`}>{idx.chg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
