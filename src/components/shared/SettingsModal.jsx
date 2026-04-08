import React, { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function SettingsModal({ onClose }) {
  const { claudeKey, alpacaKey, alpacaSecret, setKeys } = useStore()
  const [ck, setCk]  = useState(claudeKey)
  const [ak, setAk]  = useState(alpacaKey)
  const [as_, setAs] = useState(alpacaSecret)

  const save = () => {
    if (!ck) { alert('Claude API Key는 필수입니다.'); return }
    setKeys(ck, ak, as_)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-7 w-[420px] shadow-xl">
        <h3 className="text-lg font-bold mb-1">⚙️ API 설정</h3>
        <p className="text-sm text-gray-400 mb-5">API 키는 브라우저에만 저장됩니다.</p>

        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
          Claude API Key <span className="text-red-400">* 필수</span>
        </label>
        <input
          value={ck} onChange={e => setCk(e.target.value)}
          type="password" placeholder="sk-ant-..."
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 font-mono text-sm outline-none focus:border-accent focus:bg-white transition-all mb-1.5"
        />
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-4 border border-gray-200">
          🤖 AI Agent 채팅 + 웹검색에 사용 · 발급: <strong>console.anthropic.com</strong>
        </div>

        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
          Alpaca API Key <span className="text-gray-300 font-normal">(선택)</span>
        </label>
        <input
          value={ak} onChange={e => setAk(e.target.value)}
          placeholder="PK..."
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 font-mono text-sm outline-none focus:border-accent focus:bg-white transition-all mb-3"
        />

        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Alpaca Secret Key</label>
        <input
          value={as_} onChange={e => setAs(e.target.value)}
          type="password" placeholder="Secret..."
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 font-mono text-sm outline-none focus:border-accent focus:bg-white transition-all mb-1.5"
        />
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-5 border border-gray-200">
          📄 주문 실행 + 실시간 가격 업데이트에 사용 · 발급: <strong>alpaca.markets</strong> → Paper Trading
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 hover:border-gray-300 transition-all">취소</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-accent transition-all">저장 & 연결</button>
        </div>
      </div>
    </div>
  )
}
