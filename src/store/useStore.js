import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_WATCHLIST = [
  { sym: 'AAPL', co: 'Apple',     price: 213.49, chg: 1.24,  up: true  },
  { sym: 'NVDA', co: 'NVIDIA',    price: 875.32, chg: 3.87,  up: true  },
  { sym: 'MSFT', co: 'Microsoft', price: 418.90, chg: -0.42, up: false },
  { sym: 'TSLA', co: 'Tesla',     price: 172.15, chg: -2.31, up: false },
  { sym: 'META', co: 'Meta',      price: 527.43, chg: 2.10,  up: true  },
]

export const useStore = create(
  persist(
    (set, get) => ({
      // API Keys
      claudeKey: '',
      alpacaKey: '',
      alpacaSecret: '',
      setKeys: (claudeKey, alpacaKey, alpacaSecret) =>
        set({ claudeKey, alpacaKey, alpacaSecret }),

      // View
      view: 'dashboard',
      setView: (view) => set({ view }),

      // Watchlist
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

      // Alpaca Account
      alpacaAccount: null,
      setAlpacaAccount: (alpacaAccount) => set({ alpacaAccount }),

      // Alpaca Positions (portfolio)
      positions: [],
      setPositions: (positions) => set({ positions }),

      // Chat
      chatHistory: [],
      addChatMsg: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),
    }),
    {
      name: 'finly-store',
      partialState: (state) => ({
        claudeKey: state.claudeKey,
        alpacaKey: state.alpacaKey,
        alpacaSecret: state.alpacaSecret,
        watchlist: state.watchlist,
      })
    }
  )
)
