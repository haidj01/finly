import React from 'react'

const NEWS = [
  { sym: 'NVDA', time: '2시간 전', sent: 'bull', hl: 'NVIDIA, AI 칩 수요 급증으로 분기 매출 전망 상향 조정' },
  { sym: 'AAPL', time: '3시간 전', sent: 'neu',  hl: 'Apple Intelligence 기능 확대, 아이폰 판매 영향 주목' },
  { sym: 'META', time: '5시간 전', sent: 'bull', hl: 'Meta AI 광고 수익 43% 성장, 월가 예상 상회' },
  { sym: 'TSLA', time: '7시간 전', sent: 'bear', hl: 'Tesla 중국 판매 3개월 연속 감소, 경쟁 심화 우려' },
  { sym: 'MSFT', time: '9시간 전', sent: 'bull', hl: 'Microsoft Azure AI 서비스 성장률 전년비 31% 증가' },
]

const SENT = {
  bull: { cls: 'bg-accent-light text-accent-dark', label: '🟢 긍정' },
  bear: { cls: 'bg-red-50 text-red-500',           label: '🔴 부정' },
  neu:  { cls: 'bg-gray-100 text-gray-500',         label: '⚪ 중립' },
}

export default function NewsCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">Market News</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">AI Sentiment</span>
      </div>
      <div className="divide-y divide-gray-100">
        {NEWS.map((n, i) => (
          <div key={i} className="py-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded">{n.sym}</span>
              <span className="text-xs text-gray-400">{n.time}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${SENT[n.sent].cls}`}>{SENT[n.sent].label}</span>
            </div>
            <div className="text-sm font-medium text-gray-800 leading-snug">{n.hl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
