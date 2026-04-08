import React from 'react'

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200">$1</code>')
    .replace(/\n/g, '<br/>')
}

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  if (isUser) {
    return (
      <div className="flex flex-row-reverse gap-3 max-w-3xl ml-auto animate-fade-up">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">나</div>
        <div>
          <div className="bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">{msg.text}</div>
          <div className="text-xs text-gray-300 mt-1 px-1 text-right">{time}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 max-w-3xl animate-fade-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">AI</div>
      <div>
        <div
          className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
        />
        <div className="text-xs text-gray-300 mt-1 px-1">{time}</div>
      </div>
    </div>
  )
}
