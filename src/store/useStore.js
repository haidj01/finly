import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveToken, clearToken, getToken } from '../api/client'

const DEFAULT_WATCHLIST = [
  { sym: 'AAPL', co: 'Apple',     price: 213.49, chg: 1.24,  up: true  },
  { sym: 'NVDA', co: 'NVIDIA',    price: 875.32, chg: 3.87,  up: true  },
  { sym: 'MSFT', co: 'Microsoft', price: 418.90, chg: -0.42, up: false },
  { sym: 'TSLA', co: 'Tesla',     price: 172.15, chg: -2.31, up: false },
  { sym: 'META', co: 'Meta',      price: 527.43, chg: 2.10,  up: true  },
]

export const useStore = create(
  persist(
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
        set({ isAuthenticated: false, authStep: 'login', tempToken: null })
      },

      // ── View ────────────────────────────────────────────────
      view: 'dashboard',  // 'dashboard' | 'trending' | 'chat'
      setView: (view) => set({ view }),

      // ── Watchlist ───────────────────────────────────────────
      watchlist: DEFAULT_WATCHLIST,
      addWatch: (item) => set((s) => ({ watchlist: [...s.watchlist, item] })),
      removeWatch: (sym) => set((s) => ({ watchlist: s.watchlist.filter(w => w.sym !== sym) })),
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
    }),
    {
      name: 'finly-store',
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
)
