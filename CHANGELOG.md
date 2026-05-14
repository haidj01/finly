# Changelog

## [0.13.0](https://github.com/haidj01/finly/compare/finly-v0.12.1...finly-v0.13.0) (2026-05-14)


### Features

* show trading mode badge (LIVE/PAPER) next to Finly logo in header ([beeeb52](https://github.com/haidj01/finly/commit/beeeb52b7c591e8c9ba5100712fbc56a4e629dca))
* show trading mode badge next to Finly logo ([15b2a0c](https://github.com/haidj01/finly/commit/15b2a0c88cde22c0e67963921bd4b3b797c9bfdd))

## [0.12.1](https://github.com/haidj01/finly/compare/finly-v0.12.0...finly-v0.12.1) (2026-05-14)


### Bug Fixes

* clear AI recommendation state when switching stocks ([3c210a2](https://github.com/haidj01/finly/commit/3c210a2c013f5534513cf2fdbcb0a566c2369517))
* decouple trading mode fetch from Alpaca account refresh ([b8a8b43](https://github.com/haidj01/finly/commit/b8a8b43706dabdbd1045b8cf992198015cd7de61))
* decouple trading mode fetch so live-credential failure doesn't freeze the UI ([2974061](https://github.com/haidj01/finly/commit/29740614be7d5a31d545183e5df8dc393052c8cb))
* 종목 변경 시 AI 추천 패널 초기화 버그 수정 ([00c19ec](https://github.com/haidj01/finly/commit/00c19eccd6f548144bdd04dfca23cc1b0c142fe8))

## [0.12.0](https://github.com/haidj01/finly/compare/finly-v0.11.0...finly-v0.12.0) (2026-05-14)


### Features

* AI strategy recommendations in dashboard and stock detail ([d18f92f](https://github.com/haidj01/finly/commit/d18f92f66c68dff78ca260a57fb2b49dba837a2f))
* global trading mode state — all account data reflects current mode ([5553375](https://github.com/haidj01/finly/commit/5553375bacc096ef388eb14a017ad49fd05ea240))
* market regime UI + AI recommendations + global trading mode state ([b44d4ee](https://github.com/haidj01/finly/commit/b44d4ee82cfe23f2f552d5f90e912ea24f2143ec))

## [0.11.0](https://github.com/haidj01/finly/compare/finly-v0.10.0...finly-v0.11.0) (2026-05-14)


### Features

* add allowed_regimes selector to strategy creation form ([bc56833](https://github.com/haidj01/finly/commit/bc568336fed583b3aa474a0006f7118996d07c99))
* allowed_regimes selector in strategy form ([0098d7e](https://github.com/haidj01/finly/commit/0098d7eddaaf3c196be58b48885c446e94356439))

## [0.10.0](https://github.com/haidj01/finly/compare/finly-v0.9.0...finly-v0.10.0) (2026-05-14)


### Features

* add 전략/워치독 source filter to trade history page ([aecd284](https://github.com/haidj01/finly/commit/aecd284d462f1ff4fc8eefee5b47c033b5e9cd3c))
* add 전략/워치독 source filter to trade history page ([9e0ba32](https://github.com/haidj01/finly/commit/9e0ba32308db03422ef66eaafe3ef20639390acc))

## [0.9.0](https://github.com/haidj01/finly/compare/finly-v0.8.0...finly-v0.9.0) (2026-05-14)


### Features

* add watchdog status card to dashboard ([31d9c34](https://github.com/haidj01/finly/commit/31d9c348a5c9d742ee1930f644f758552d3e6a5d))

## [0.8.0](https://github.com/haidj01/finly/compare/finly-v0.7.0...finly-v0.8.0) (2026-05-14)


### Features

* add paper/live mode tabs to trade history page ([4d00ba5](https://github.com/haidj01/finly/commit/4d00ba50883093607bb54d03e193409d2b2d0948))
* add paper/live mode tabs to trade history page ([7828be7](https://github.com/haidj01/finly/commit/7828be74f839a759e226c164979494440b01a5ea))

## [0.7.0](https://github.com/haidj01/finly/compare/finly-v0.6.0...finly-v0.7.0) (2026-05-14)


### Features

* add paper/live trading mode switch UI ([c343edf](https://github.com/haidj01/finly/commit/c343edf0a962949900770280dd01be72afd4e666))
* paper/live trading mode switch UI ([0f8a264](https://github.com/haidj01/finly/commit/0f8a264239970cc61752d40318dae27a109f5555))
* separate paper/live strategy view in StockDetail ([04c4968](https://github.com/haidj01/finly/commit/04c49689c350140113c9e5cfacd5704b8349f91d))
* separate paper/live strategy view in StockDetail ([148067b](https://github.com/haidj01/finly/commit/148067b26c677f6e56b8fbbc18454bcecd767ee2))

## [0.6.0](https://github.com/haidj01/finly/compare/finly-v0.5.0...finly-v0.6.0) (2026-05-13)


### Features

* strategy UI for P1-P4 types + market regime dashboard card ([2e6a7cb](https://github.com/haidj01/finly/commit/2e6a7cb227995e0d146d1c31abb4d88d33ee4d6c))

## [0.5.0](https://github.com/haidj01/finly/compare/finly-v0.4.0...finly-v0.5.0) (2026-05-06)


### Features

* display options flow, insider trades, and news in trending cards ([92f153a](https://github.com/haidj01/finly/commit/92f153aeb76fb00264f3959d660f31f9548e5b56))
* display options flow, insider trades, and news in trending stock cards ([fb42e4b](https://github.com/haidj01/finly/commit/fb42e4bc0d74ed4c2a54ecf1aef7beef74580bb7))


### Bug Fixes

* add .env.production with EC2 API URL for production builds ([e62b7f8](https://github.com/haidj01/finly/commit/e62b7f8bb0a4f9fdb0e790481ed4fa35ee19b363))
* use CloudFront HTTPS URL as API base to resolve mixed content ([cf2eda8](https://github.com/haidj01/finly/commit/cf2eda8ca5ed93d2598565f85897f27ee73373c0))

## [0.4.0](https://github.com/haidj01/finly/compare/finly-v0.3.2...finly-v0.4.0) (2026-05-06)


### Features

* trade history view, stock detail history, AI strategy recommendation ([aaa62b2](https://github.com/haidj01/finly/commit/aaa62b20912b6673171e3becacff50b3c5e7a83f))
* trade history view, stock detail history, AI strategy recommendation ([88a4b62](https://github.com/haidj01/finly/commit/88a4b6291ece9f4a89d2a43fbd9f5d547b67c652))
* **trending:** display PE, analyst rating, growth, grade badges on stock cards ([b6fc20b](https://github.com/haidj01/finly/commit/b6fc20bc08eb1f153520d0d72aaff1a2392cf634))
* **trending:** show grade badge, PE, analyst rating, growth on stock cards ([de50906](https://github.com/haidj01/finly/commit/de509060ff82218c465c0fdd0e7b6c876bd0afa4))
* 주목종목 자동 새로고침 + 상세 로딩 UI 추가 ([4e1805f](https://github.com/haidj01/finly/commit/4e1805f1cda403695f7d74ba8a706f433faadf0a))


### Bug Fixes

* handle CloudFront SPA fallback returning HTML for API 404 errors ([2fbe497](https://github.com/haidj01/finly/commit/2fbe497bbe6f6c3833a9978e2563169ff0c51292))

## [0.3.2](https://github.com/haidj01/finly/compare/finly-v0.3.1...finly-v0.3.2) (2026-04-29)


### Bug Fixes

* align strategy form payload with backend CreateStrategyRequest schema ([004e19e](https://github.com/haidj01/finly/commit/004e19eb85e0ea251673257aacbe31e50e965bab))
* align strategy form payload with backend schema ([b3efb4e](https://github.com/haidj01/finly/commit/b3efb4efde9687e7c480fa102777055a50ec4b51))
* fix trending watchlist add bugs and improve UX ([44297d9](https://github.com/haidj01/finly/commit/44297d9461a7ec64c27b211a8776419d8f10ff8e))
* trending watchlist add bugs and UX improvements ([e3f8ba2](https://github.com/haidj01/finly/commit/e3f8ba2e32129346c36855f6adc2e07a3f1b035a))

## [0.3.1](https://github.com/haidj01/finly/compare/finly-v0.3.0...finly-v0.3.1) (2026-04-23)


### Bug Fixes

* show error message on AI signal refresh failure ([b5f584a](https://github.com/haidj01/finly/commit/b5f584a4b78be54f4f9ed2ec2b3726fd105e8f20))

## [0.3.0](https://github.com/haidj01/finly/compare/finly-v0.2.0...finly-v0.3.0) (2026-04-23)


### Features

* add 종목 조회 tab with stock detail, chart, orders, and strategies ([923038c](https://github.com/haidj01/finly/commit/923038cf1fcfe8205fae6f231b03464346b8b1eb))
* 종목 조회 탭 — 차트, 주문, 전략 설정 ([ddc0ab6](https://github.com/haidj01/finly/commit/ddc0ab6d882bbfe2307de52bd8eb29f99ce34939))


### Bug Fixes

* fetch version from /api/version for CloudFront routing ([9dca52e](https://github.com/haidj01/finly/commit/9dca52e746f9b00915435eaaeef80d7a49e557b5))
* read agent version from backend /version response ([40e326f](https://github.com/haidj01/finly/commit/40e326fc33c749219b0aeec3fdf19fef7801f558))

## [0.2.0](https://github.com/haidj01/finly/compare/finly-v0.1.0...finly-v0.2.0) (2026-04-23)


### Features

* add authentication flow and UI component refactor ([800bd7e](https://github.com/haidj01/finly/commit/800bd7eb8d83d74e8d11a5fb9c35b61a8ac06864))
* add authentication flow and UI component refactor ([8c173b8](https://github.com/haidj01/finly/commit/8c173b88759ed48f74e171e1b64b809b88a04347))
* authentication flow, Trending component, and infra setup ([4699ff4](https://github.com/haidj01/finly/commit/4699ff4d1491229c1365428797313715d2169b12))
* display deployed versions in header ([88be9e0](https://github.com/haidj01/finly/commit/88be9e0d1ea78ea3cfe9e8ed34f559e2d41ab787))
* display deployed versions in header (frontend/backend/agent) ([abace00](https://github.com/haidj01/finly/commit/abace00b7f26b8ec71d18b5d6348852e59bfae0c))
