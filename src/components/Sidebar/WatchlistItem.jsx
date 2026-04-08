import React, { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function WatchlistItem({ item }) {
  const removeWatch = useStore(s => s.removeWatch)
  const [hover, setHover] = useState(false)

  return (
    <div
      className="flex justify-between items-center px-2 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
          {item.sym.slice(0, 3)}
        </div>
        <div>
          <div className="text-sm font-bold">{item.sym}</div>
          <div className="text-xs text-gray-400">{item.co}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-sm font-bold">${item.price.toFixed(2)}</div>
          <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${item.up ? 'bg-accent-light text-accent-dark' : 'bg-red-50 text-red-500'}`}>
            {item.up ? '+' : ''}{item.chg.toFixed(2)}%
          </div>
        </div>
        {hover && (
          <button
            onClick={() => removeWatch(item.sym)}
            className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md px-1 py-0.5 text-base leading-none transition-all"
          >×</button>
        )}
      </div>
    </div>
  )
}
