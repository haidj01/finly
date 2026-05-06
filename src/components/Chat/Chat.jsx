import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { sendMessage } from '../../api/claude'
import ChatMessage from './ChatMessage'
import ActionCard from './ActionCard'
import StrategyCard from './StrategyCard'

const CHIPS = ['AAPL 분석해줘', 'NVDA 매수해도 될까?', '내 포트폴리오 평가해줘', '오늘 시장 시황', 'S&P500 전망은?', '리스크 분석']

export default function Chat() {
  const { chatHistory, addChatMsg, positions } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiMessages, setApiMessages] = useState([])
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [chatHistory, loading])

  const buildSystem = () => {
    const portCtx = positions.map(p =>
      `${p.symbol}:${parseFloat(p.qty)}주 평균$${parseFloat(p.avg_entry_price).toFixed(2)} 현재$${parseFloat(p.current_price).toFixed(2)}`
    ).join(', ') || '포지션 없음'

    return `당신은 미국 주식 투자 전문 AI Agent "Finly"입니다.

사용자 포트폴리오: ${portCtx}

역할:
- 웹검색으로 실시간 주가·뉴스·시황 조회 후 정확한 정보 제공
- 기술적/펀더멘털 분석 기반 매매 추천 (BUY/SELL/HOLD)
- 추천 시 반드시 현재가·목표가·손절가·근거·리스크 명시
- 한국어 답변, 수치 구체적으로 제시
- 매매 추천 시 마지막에 반드시 "⚠️ 투자 판단은 본인 책임입니다" 포함

전략 추천 규칙:
종목 분석 시 손절가·목표가 수치가 명확하다면 답변 마지막에 반드시 아래 블록을 포함하세요:
[[STRATEGIES]]
[{"type":"stop_loss","symbol":"티커","name":"전략명","condition":{"drop_pct":숫자},"action":{"side":"sell","qty_pct":100}},{"type":"take_profit","symbol":"티커","name":"전략명","condition":{"gain_pct":숫자},"action":{"side":"sell","qty_pct":100}},{"type":"price_target","symbol":"티커","name":"전략명","condition":{"target_price":숫자,"direction":"above"},"action":{"side":"sell","qty_pct":100}}]
[[/STRATEGIES]]
- type은 stop_loss(손절), take_profit(익절), price_target(목표가) 중 선택
- 분석에서 도출된 실제 수치만 사용, 불확실하면 해당 항목 생략
- 블록은 마크다운 코드블록 없이 순수 텍스트로만`
  }

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    addChatMsg({ role: 'user', text: msg })
    setInput('')
    if (inputRef.current) { inputRef.current.style.height = 'auto' }
    setLoading(true)

    const newApiMsgs = [...apiMessages, { role: 'user', content: msg }]
    setApiMessages(newApiMsgs)

    try {
      const data = await sendMessage(newApiMsgs, buildSystem())
      const reply = data.content.filter(b => b.type === 'text').map(b => b.text).join('')
      setApiMessages(prev => [...prev, { role: 'assistant', content: data.content }])

      const stratMatch = reply.match(/\[\[STRATEGIES\]\]([\s\S]*?)\[\[\/STRATEGIES\]\]/)
      let strategies = null
      let cleanReply = reply
      if (stratMatch) {
        try {
          strategies = JSON.parse(stratMatch[1].trim())
        } catch {}
        cleanReply = reply.replace(/\[\[STRATEGIES\]\][\s\S]*?\[\[\/STRATEGIES\]\]/, '').trim()
      }

      const isBuy  = /매수|BUY/i.test(cleanReply)
      const isSell = /매도|SELL/i.test(cleanReply)
      const tm     = cleanReply.match(/\b([A-Z]{2,5})\b/)
      const actionTicker = (isBuy || isSell) && tm ? tm[1] : null

      addChatMsg({ role: 'ai', text: cleanReply, action: actionTicker ? { sym: actionTicker, isBuy, isSell } : null, strategies })
    } catch (e) {
      addChatMsg({ role: 'ai', text: `⚠️ 오류가 발생했습니다: ${e.message}` })
    }
    setLoading(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const onInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Messages */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin">
        {chatHistory.length === 0 && (
          <div className="flex gap-3 animate-fade-up max-w-2xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">AI</div>
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm leading-relaxed">
                안녕하세요! 👋 저는 <strong>Finly AI Agent</strong>입니다.<br /><br />
                실시간 웹검색으로 주가와 뉴스를 조회하고, 종목 분석과 <strong>BUY / SELL / HOLD</strong> 추천을 제공합니다.<br /><br />
                무엇이든 물어보세요! 📈
              </div>
              <div className="text-xs text-gray-300 mt-1 px-1">{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i}>
            <ChatMessage msg={msg} />
            {msg.action && <ActionCard action={msg.action} />}
            {msg.strategies && msg.strategies.length > 0 && <StrategyCard strategies={msg.strategies} />}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">AI</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full bg-gray-300 think-dot`} style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Chips */}
      <div className="flex gap-2 px-5 py-3 flex-wrap border-t border-gray-100 bg-white">
        {CHIPS.map(c => (
          <button key={c} onClick={() => send(c)}
            className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:border-accent hover:text-accent-dark hover:bg-accent-light transition-all whitespace-nowrap">
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 py-3.5 bg-white border-t border-gray-200 flex gap-3 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder="종목 분석, 매매 추천, 시황... 무엇이든 물어보세요"
          rows={1}
          className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all focus:border-accent focus:bg-white min-h-[46px] max-h-[120px] leading-relaxed"
          style={{ height: '46px' }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="w-[46px] h-[46px] bg-gray-900 hover:bg-accent disabled:opacity-40 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
