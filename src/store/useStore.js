import { create } from 'zustand'
import { saveToken, clearToken, getToken } from '../api/client'
import { fetchWatchlist, addWatchlistItem, removeWatchlistItem } from '../api/watchlist'

export const useStore = create(
  (set) => ({
      // ── Auth ────────────────────────────────────────────────
      isAuthenticated: !!getToken(),
      authStep: 'login',   // 'login' | 'mfa'
      tempToken: null,

      setTempToken: (tempToken) => set({ tempToken, authStep: 'mfa' }),
      setToken: (token) => {
        saveToken(token)
        set({ isAuthenticated: true, authStep: 'login', tempToken: null })
      },
      logout: () => {
        clearToken()
        set({ isAuthenticated: false, authStep: 'login', tempToken: null, watchlist: [] })
      },

      // ── View ────────────────────────────────────────────────
      view: 'dashboard',  // 'dashboard' | 'trending' | 'chat' | 'stock'
      setView: (view) => set({ view }),

      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // ── Stock Detail ─────────────────────────────────────────
      selectedSymbol: null,
      setSelectedSymbol: (sym) => set({ selectedSymbol: sym, view: 'stock' }),

      // ── Trade History navigation ──────────────────────────
      historySymbol: null,
      navigateToHistory: (sym) => set({ view: 'history', historySymbol: sym ?? null }),
      clearHistorySymbol: () => set({ historySymbol: null }),

      // ── Watchlist ───────────────────────────────────────────
      watchlist: [],
      loadWatchlist: async () => {
        try {
          const items = await fetchWatchlist()
          set({
            watchlist: items.map(w => ({
              sym: w.symbol,
              co: w.company_name,
              price: 0,
              chg: 0,
              up: true,
            }))
          })
        } catch (e) {
          console.error('watchlist 로드 실패:', e)
        }
      },
      addWatch: async (item) => {
        await addWatchlistItem(item.sym, item.co)
        set(s => ({ watchlist: [...s.watchlist, item] }))
      },
      removeWatch: async (sym) => {
        try {
          await removeWatchlistItem(sym)
          set(s => ({ watchlist: s.watchlist.filter(w => w.sym !== sym) }))
        } catch (e) {
          console.error('watchlist 삭제 실패:', e)
        }
      },
      updateWatchPrices: (prices) => set((s) => ({
        watchlist: s.watchlist.map(w =>
          prices[w.sym] ? {
            ...w,
            chg: +(prices[w.sym] - w.price).toFixed(2),
            up: prices[w.sym] >= w.price,
            price: prices[w.sym]
          } : w
        )
      })),

      // ── Alpaca ──────────────────────────────────────────────
      tradingMode: null,   // 'paper' | 'live'
      setTradingMode: (tradingMode) => set({ tradingMode }),

      alpacaAccount: null,
      setAlpacaAccount: (alpacaAccount) => set({ alpacaAccount }),

      positions: [],
      setPositions: (positions) => set({ positions }),

      orders: [],
      setOrders: (orders) => set({ orders }),

      // ── Chat ────────────────────────────────────────────────
      chatHistory: [],
      addChatMsg: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),
  })
)
