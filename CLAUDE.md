# CLAUDE.md

박물관 탐험대 — 초중고 자녀 맞춤 전국 박물관 추천 서비스

---

## 프로젝트 개요

초중고 자녀를 둔 부모가 아이 나이에 맞는 전국 박물관을 탐색하고, 리뷰를 남기고, AI 맞춤 추천을 받을 수 있는 웹 앱.

## 기술 스택

- **프레임워크:** Next.js 15 (App Router)
- **데이터베이스:** Supabase (PostgreSQL + Auth + Realtime)
- **스타일링:** Tailwind CSS
- **AI:** Claude API (Anthropic)
- **지도:** 카카오맵 JavaScript SDK
- **배포:** Vercel (GitHub 연동 자동 배포)
- **패키지 매니저:** npm

## 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
```

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase 익명 키
SUPABASE_SERVICE_ROLE_KEY=        # Supabase 서비스 롤 키 (서버 전용)
NEXT_PUBLIC_KAKAO_APP_KEY=        # 카카오맵 JavaScript 앱 키
ANTHROPIC_API_KEY=                # Claude API 키
```

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
│   ├── page.tsx         # 메인 (박물관 목록 + 지도)
│   ├── museums/[id]/    # 박물관 상세
│   ├── recommend/       # AI 맞춤 추천
│   ├── auth/            # 로그인/회원가입
│   └── api/             # API 라우트 (Claude, Supabase)
├── components/          # 재사용 UI 컴포넌트
├── lib/                 # Supabase 클라이언트, 유틸리티
├── types/               # TypeScript 타입 정의
└── data/                # 시드 데이터 (박물관 JSON)
```

## 코딩 컨벤션

- 컴포넌트: PascalCase (`MuseumCard.tsx`)
- 함수/변수: camelCase
- 타입/인터페이스: PascalCase, `I` 접두사 사용 안 함
- 파일당 하나의 컴포넌트 export
- 한국어 UI, 코드 주석은 영어
- Server Components 기본, 필요한 경우만 `'use client'`

## 데이터베이스 테이블

- **museums** — 박물관 정보 (이름, 주소, 좌표, 카테고리, 운영시간, 입장료, 설명, 이미지 URL)
- **programs** — 교육 프로그램 (박물관 ID, 프로그램명, 대상 연령, 일정, 비용)
- **reviews** — 사용자 리뷰 (박물관 ID, 유저 ID, 평점, 내용, 자녀 나이)
- **favorites** — 즐겨찾기 (박물관 ID, 유저 ID)
- **visits** — 방문 기록 (박물관 ID, 유저 ID, 방문일, 메모)
- **profiles** — 사용자 프로필 (유저 ID, 닉네임, 자녀 정보, 지역)

## 주요 페이지

1. **메인** — 박물관 목록 (카드) + 카카오맵 지도 + 지역/카테고리 필터
2. **상세** — 박물관 정보, 프로그램, 리뷰 목록, 즐겨찾기
3. **AI 추천** — 자녀 나이 입력 → Claude 맞춤 추천 / 여행지 입력 → 근처 박물관 추천
4. **내 지도** — 방문한 박물관 마커 표시 (방문 기록 지도)
5. **가족 랭킹** — 다른 가족과 방문 횟수/다양성 비교
6. **로그인/회원가입** — Supabase Auth (이메일)
