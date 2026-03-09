# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start       # 개발 서버 실행 (CRA, localhost:3000)
npm run build   # 프로덕션 빌드
```

## Architecture

Create React App 기반의 두쫀쿠(도넛) 재고 지도 서비스.

### 데이터 흐름

- `App.jsx` — Firebase Auth 상태를 구독하여 `user`를 전역으로 관리, `Header`와 각 페이지에 전달
- `MainPage` — Firestore `stores` 컬렉션을 실시간 구독(`subscribeToStores`), `KakaoMap`과 `StorePopup`에 상태 전달
- `RegisterPage` — `StoreForm` 컴포넌트만 렌더링하는 얇은 래퍼

### Firebase (`src/firebase/`)

| 파일 | 역할 |
|------|------|
| `config.js` | Firebase 초기화, `db`(Firestore), `auth` export |
| `auth.js` | 이메일 회원가입/로그인/로그아웃, `subscribeToAuth` |
| `stores.js` | `stores` 컬렉션 CRUD — `subscribeToStores`, `addStore`, `updateStore`, `updateStock` |

Firestore 문서 스키마: `{ name, address, phone, lat, lng, duzzonCount, createdAt, updatedAt }`

### 지도 (`KakaoMap.jsx`)

- 카카오 지도 SDK를 `<script>` 동적 삽입으로 로드 (`KAKAO_APP_KEY` 사용)
- 마커는 `kakao.maps.CustomOverlay`에 DOM 엘리먼트를 직접 전달 (문자열 HTML 아님)
- `duzzonCount` 기준 상태: `soldout`(0개) / `low`(1–3개) / `normal`(4개+)
- 필터(`all/available/low/soldout`)는 컴포넌트 내부 state로 관리

### 스타일

- SCSS + BEM 방식, `src/styles/_variables.scss`에서 토큰 중앙 관리
- 브레이크포인트: `$bp-md: 768px`, `$bp-sm: 480px`
- 헤더 높이: 데스크탑 `$header-height: 68px` / `≤768px` 60px / `≤480px` 56px

### 환경변수 (`.env`, git 제외됨)

```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID
REACT_APP_KAKAO_APP_KEY
```
