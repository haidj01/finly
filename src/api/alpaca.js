const PAPER = 'https://paper-api.alpaca.markets'
const DATA  = 'https://data.alpaca.markets'

function headers(key, secret) {
  return { 'APCA-API-KEY-ID': key, 'APCA-API-SECRET-KEY': secret }
}

export async function fetchAccount(key, secret) {
  const res = await fetch(`${PAPER}/v2/account`, { headers: headers(key, secret) })
  if (!res.ok) throw new Error('Account fetch failed')
  return res.json()
}

export async function fetchPositions(key, secret) {
  const res = await fetch(`${PAPER}/v2/positions`, { headers: headers(key, secret) })
  if (!res.ok) throw new Error('Positions fetch failed')
  return res.json()
}

export async function fetchLatestPrices(key, secret, symbols) {
  const syms = symbols.join(',')
  const res = await fetch(`${DATA}/v2/stocks/trades/latest?symbols=${syms}&feed=iex`, {
    headers: headers(key, secret)
  })
  if (!res.ok) throw new Error('Price fetch failed')
  const data = await res.json()
  const result = {}
  Object.entries(data.trades || {}).forEach(([sym, t]) => {
    if (t?.p) result[sym] = +t.p.toFixed(2)
  })
  return result
}

export async function fetchAsset(key, secret, sym) {
  const res = await fetch(`${DATA}/v2/assets/${sym}`, { headers: headers(key, secret) })
  if (!res.ok) return null
  return res.json()
}

export async function placeOrder(key, secret, { symbol, qty, side }) {
  const res = await fetch(`${PAPER}/v2/orders`, {
    method: 'POST',
    headers: { ...headers(key, secret), 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, qty, side, type: 'market', time_in_force: 'day' })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || '주문 실패')
  return data
}
