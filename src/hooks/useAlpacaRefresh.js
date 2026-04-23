import { useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { fetchAccount, fetchPositions, fetchLatestPrices, fetchOrders } from '../api/alpaca'

export function useAlpacaRefresh() {
  const { watchlist, setAlpacaAccount, setPositions, setOrders, updateWatchPrices } = useStore()

  const refresh = useCallback(async () => {
    try {
      const [acct, pos, ord] = await Promise.all([fetchAccount(), fetchPositions(), fetchOrders()])
      setAlpacaAccount(acct)
      setPositions(pos)
      setOrders(ord)

      const syms = [...new Set([
        ...watchlist.map(w => w.sym),
        ...pos.map(p => p.symbol),
      ])]
      if (syms.length) {
        const prices = await fetchLatestPrices(syms)
        updateWatchPrices(prices)
      }
    } catch (e) {
      console.error('Alpaca refresh error:', e)
    }
  }, [watchlist])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return { refresh }
}
