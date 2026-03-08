# 🍩 DuZZonMap

> 두쫀쿠 재고를 쉽게 확인할 수 있는 지도 서비스

## 기술 스택
- **Frontend**: React.js + SCSS
- **지도**: Kakao Maps API
- **백엔드/DB**: Firebase (Firestore + Auth)

---

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. Authentication → 이메일/비밀번호 로그인 활성화
3. Firestore Database 생성
4. `src/firebase/config.js`에 본인 설정값 입력:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Kakao Maps API 설정

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션 등록
2. **플랫폼** → 웹 → 사이트 도메인 등록 (예: `http://localhost:3000`)
3. **카카오 지도 API** 사용 설정 (제품 → 지도)
4. `src/components/Map/KakaoMap.jsx`와 `src/components/StoreForm/StoreForm.jsx`의 `KAKAO_APP_KEY` 교체:
```js
const KAKAO_APP_KEY = 'YOUR_KAKAO_JS_APP_KEY'; // JavaScript 키 사용
```

### 4. Firestore 보안 규칙 적용
`firestore.rules` 파일을 Firebase Console → Firestore → Rules에 붙여넣고 게시

### 5. 개발 서버 실행
```bash
npm start
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Header/          # 공통 헤더 (로고 + 매장등록 버튼)
│   ├── Map/             # 네이버 지도 + 마커
│   ├── StorePopup/      # 매장 클릭 시 바텀 팝업
│   └── StoreForm/       # 매장 등록/수정 폼 + 인증
├── firebase/
│   ├── config.js        # Firebase 초기화
│   ├── stores.js        # 매장 CRUD
│   └── auth.js          # 사장님 인증
├── pages/
│   ├── Main/            # 메인 지도 페이지
│   └── Register/        # 매장 등록 페이지
└── styles/
    ├── _variables.scss  # 색상, 폰트, 간격 변수
    └── global.scss      # 전역 스타일 + 애니메이션
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| 🗺 두쫀쿠 지도 | 네이버 지도 위에 두쫀쿠 마커 표시 |
| 🍩 실시간 재고 | Firebase Realtime 구독으로 재고 실시간 반영 |
| 📊 재고 필터 | 전체 / 구매가능 / 마감임박 / 품절 필터링 |
| 🏪 바텀 팝업 | 마커 클릭 시 가게 정보 슬라이드업 팝업 |
| 🔐 사장님 인증 | Firebase Auth 이메일 로그인 |
| ✏️ 재고 수정 | 해당 매장 사장님만 수정 가능 |
| 📍 위치 지정 | 지도 클릭으로 매장 위치 핀 설정 |

---

## 🔒 보안

- Firestore Rules로 매장 수정 권한을 사장님(ownerId)으로 제한
- 일반 사용자는 읽기만 가능
- Firebase Auth UID 기반 소유자 검증
