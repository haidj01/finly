# Finly — Stock Intelligence Agent

React + Vite + Tailwind CSS + Zustand

## 실행 방법

```bash
# 1. 패키지 설치
cd finly
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 열기
# http://localhost:3000
```

## 프로젝트 구조

```
src/
├── api/
│   ├── alpaca.js         # Alpaca Paper Trading API
│   └── claude.js         # Claude API (AI Agent + 웹검색)
├── components/
│   ├── Header.jsx         # 헤더 (탭, API 상태, 설정)
│   ├── Sidebar/
│   │   ├── Sidebar.jsx    # 사이드바 (Watchlist + 계좌)
│   │   ├── WatchlistItem.jsx
│   │   └── AlpacaAccount.jsx
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── IndicesCard.jsx  # 시장 지수
│   │   ├── SignalsCard.jsx  # AI 매매 신호
│   │   ├── PortfolioCard.jsx # 실제 포지션
│   │   └── NewsCard.jsx    # 뉴스
│   ├── Chat/
│   │   ├── Chat.jsx        # AI Agent 채팅
│   │   ├── ChatMessage.jsx
│   │   └── ActionCard.jsx  # 매수/매도 액션 카드
│   └── shared/
│       ├── OrderModal.jsx  # 주문 모달
│       └── SettingsModal.jsx # API 설정
├── hooks/
│   └── useAlpacaRefresh.js # 5분마다 자동 새로고침
├── store/
│   └── useStore.js         # Zustand 전역 상태
└── App.jsx
```

## API 설정

앱 실행 후 우측 상단 ⚙️ 버튼:

1. **Claude API Key** (필수) → console.anthropic.com
2. **Alpaca API Key + Secret** (선택) → alpaca.markets (Paper Trading)

## Phase 2 계획 (백엔드)

- FastAPI 백엔드 추가
- API Key 서버 관리 (보안 강화)
- WebSocket 실시간 주가 스트리밍
- PostgreSQL DB 연동
- 사용자 인증
