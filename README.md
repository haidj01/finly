# Finly — Stock Intelligence Agent (Frontend)

React + Vite + Tailwind CSS + Zustand + Recharts

> 백엔드: [finly-backend](../finly-backend) (FastAPI) 가 반드시 실행 중이어야 합니다.

## 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# VITE_API_URL=http://localhost:8000  ← 백엔드 주소 (기본값 그대로 사용 가능)

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## 프로젝트 구조

```
src/
├── api/
│   ├── alpaca.js          # Alpaca API 프록시 호출 (백엔드 경유)
│   └── claude.js          # Claude API 프록시 호출 (백엔드 경유)
├── components/
│   ├── Header.jsx          # 헤더 (탭 전환, 장 시간 표시)
│   ├── Sidebar/
│   │   ├── Sidebar.jsx     # Watchlist 관리
│   │   ├── WatchlistItem.jsx
│   │   └── AlpacaAccount.jsx
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── IndicesCard.jsx   # 시장 지수
│   │   ├── SignalsCard.jsx   # AI 매매 신호
│   │   ├── PortfolioCard.jsx # Alpaca 포지션
│   │   └── NewsCard.jsx      # 뉴스
│   ├── Trending/
│   │   └── Trending.jsx      # 주목 종목 (거래량 급등 / 상승 / 하락 상위)
│   ├── Chat/
│   │   ├── Chat.jsx          # AI Agent 채팅
│   │   ├── ChatMessage.jsx
│   │   └── ActionCard.jsx    # 매수/매도 액션 카드
│   └── shared/
│       └── OrderModal.jsx    # 주문 모달
├── hooks/
│   └── useAlpacaRefresh.js  # 5분마다 자동 새로고침 (계좌·포지션·주문·시세)
├── store/
│   └── useStore.js           # Zustand 전역 상태 (watchlist만 localStorage 유지)
└── App.jsx
```

## 탭 구조

| 탭 키 | 컴포넌트 | 설명 |
|---|---|---|
| `dashboard` | `Dashboard` | 시장 지수, AI 매매 신호, 포트폴리오, 뉴스 |
| `trending` | `Trending` | 거래량 급등·상승·하락 상위 종목 분석 |
| `chat` | `Chat` | Claude AI Agent 채팅 |

## 아키텍처

```
Browser (React)
    │
    │  HTTP (API 키 없음)
    ▼
finly-backend (FastAPI)
    ├──▶ Claude API   (API 키는 백엔드 .env 관리)
    └──▶ Alpaca API   (API 키는 백엔드 .env 관리)
```

- API 키는 브라우저에 전혀 노출되지 않습니다.
- localStorage에는 watchlist만 저장됩니다.

## API 함수

### `src/api/claude.js`

| 함수 | 엔드포인트 | 설명 |
|---|---|---|
| `sendMessage(messages, systemPrompt)` | `POST /api/claude/chat` | 채팅 메시지 전송 |
| `fetchSignals(symbols)` | `POST /api/claude/signals` | AI 매매 신호 조회 |
| `searchTicker(query)` | `POST /api/claude/search-ticker` | 종목 티커 검색 |

### `src/api/alpaca.js`

| 함수 | 엔드포인트 | 설명 |
|---|---|---|
| `fetchAccount()` | `GET /api/alpaca/account` | 계좌 정보 조회 |
| `fetchPositions()` | `GET /api/alpaca/positions` | 보유 포지션 조회 |
| `fetchLatestPrices(symbols)` | `GET /api/alpaca/prices` | 실시간 시세 조회 |
| `fetchAsset(sym)` | `GET /api/alpaca/asset/:sym` | 종목 정보 조회 |
| `fetchOrders(status, limit)` | `GET /api/alpaca/orders` | 주문 내역 조회 |
| `fetchNews(symbols)` | `GET /api/news` | 뉴스 조회 |
| `placeOrder({ symbol, qty, side })` | `POST /api/alpaca/orders` | 주문 실행 |

## 상태 관리 (`useStore.js`)

| 상태 | 타입 | 설명 | 영속화 |
|---|---|---|---|
| `view` | `string` | 현재 탭 (`dashboard` \| `trending` \| `chat`) | X |
| `watchlist` | `array` | 관심 종목 목록 | O (localStorage) |
| `alpacaAccount` | `object\|null` | Alpaca 계좌 정보 | X |
| `positions` | `array` | 보유 포지션 목록 | X |
| `orders` | `array` | 주문 내역 목록 | X |
| `chatHistory` | `array` | 채팅 메시지 히스토리 | X |

## 환경변수

| 변수 | 설명 | 기본값 |
|---|---|---|
| `VITE_API_URL` | 백엔드 서버 주소 | `http://localhost:8000` |

## Phase 3 계획

- WebSocket 실시간 주가 스트리밍
- 사용자 인증
- PostgreSQL 포트폴리오 히스토리 저장
