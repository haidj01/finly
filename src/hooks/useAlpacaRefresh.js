import { useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { fetchAccount, fetchPositions, fetchLatestPrices } from '../api/alpaca'

export function useAlpacaRefresh() {
  const { alpacaKey, alpacaSecret, watchlist, setAlpacaAccount, setPositions, updateWatchPrices } = useStore()

  const refresh = useCallback(async () => {
    if (!alpacaKey || !alpacaSecret) return
    try {
      const [acct, pos] = await Promise.all([
        fetchAccount(alpacaKey, alpacaSecret),
        fetchPositions(alpacaKey, alpacaSecret)
      ])
      setAlpacaAccount(acct)
      setPositions(pos)

      // Price update for watchlist + positions
      const syms = [...new Set([
        ...watchlist.map(w => w.sym),
        ...pos.map(p => p.symbol)
      ])]
      if (syms.length) {
        const prices = await fetchLatestPrices(alpacaKey, alpacaSecret, syms)
        updateWatchPrices(prices)
      }
    } catch (e) {
      console.error('Alpaca refresh error:', e)
    }
  }, [alpacaKey, alpacaSecret, watchlist])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [alpacaKey, alpacaSecret])

  return { refresh }
}
