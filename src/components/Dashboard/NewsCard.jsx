import React, { useState, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { fetchNews } from '../../api/alpaca'

const SENT = {
  bull: { cls: 'bg-accent-light text-accent-dark', label: '🟢 긍정' },
  bear: { cls: 'bg-red-50 text-red-500',           label: '🔴 부정' },
  neu:  { cls: 'bg-gray-100 text-gray-500',         label: '⚪ 중립' },
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (diff < 60)   return `${diff}분 전`
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`
  return `${Math.floor(diff / 1440)}일 전`
}

function NewsItem({ n }) {
  const sent = SENT[n.sent] || SENT.neu
  return (
    <a
      href={n.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="py-3 flex flex-col gap-1.5 hover:opacity-75 transition-opacity"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded">{n.sym}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${sent.cls}`}>{sent.label}</span>
        <span className="text-xs text-gray-400">{timeAgo(n.time)}</span>
        {n.source && <span className="text-xs text-gray-300">{n.source}</span>}
      </div>
      <div className="text-sm font-medium text-gray-800 leading-snug">{n.hl}</div>
      {n.hl_ko && n.hl_ko !== n.hl && (
        <div className="text-sm text-gray-500 leading-snug">{n.hl_ko}</div>
      )}
    </a>
  )
}

function NewsSection({ title, badge, data, loading }) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gray-500">{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">{badge}</span>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!data.ok) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gray-500">{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-400">{badge}</span>
        </div>
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-50 border border-red-100">
          <span className="text-sm">🚫</span>
          <span className="text-xs text-red-400">{data.error || '뉴스를 불러올 수 없습니다.'}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-500">{title}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-light text-accent-dark">{badge}</span>
        <span className="text-xs text-gray-300">{data.items.length}건</span>
      </div>
      <div className="divide-y divide-gray-100">
        {data.items.map((n, i) => <NewsItem key={i} n={n} />)}
      </div>
    </div>
  )
}

export default function NewsCard() {
  const { watchlist } = useStore()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const symbols = watchlist.map(w => w.sym)
    if (!symbols.length) return
    setLoading(true)
    try {
      const data = await fetchNews(symbols)
      setResult(data)
    } catch (e) {
      console.error('[NewsCard]', e)
      setResult({
        alpaca: { ok: false, error: e.message, items: [] },
        google: { ok: false, error: e.message, items: [] },
      })
    }
    setLoading(false)
  }, [watchlist])

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm col-span-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">Market News</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">AI Sentiment</span>
          <button
            onClick={load}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-accent hover:text-accent-dark transition-all disabled:opacity-40"
          >
            {loading ? '로딩 중...' : '↻ 새로고침'}
          </button>
        </div>
      </div>

      {!result && !loading && (
        <div className="text-sm text-gray-400 py-4 text-center">새로고침을 눌러 뉴스를 불러오세요.</div>
      )}

      {(result || loading) && (
        <div className="flex flex-col gap-6">
          <NewsSection
            title="Alpaca News"
            badge="alpaca.markets"
            data={result?.alpaca || { ok: true, items: [] }}
            loading={loading}
          />
          <div className="border-t border-gray-100" />
          <NewsSection
            title="Google News"
            badge="news.google.com"
            data={result?.google || { ok: true, items: [] }}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
