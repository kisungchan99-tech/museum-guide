# plan.md — 박물관 탐험대 구현 계획

## Phase 1: 프로젝트 초기 설정

### 1.1 Next.js 프로젝트 생성
- `npx create-next-app@latest` (TypeScript, Tailwind CSS, App Router, src/ 디렉토리)
- ESLint 기본 설정

### 1.2 Supabase 연동
- Supabase 프로젝트 생성 (supabase.com)
- `@supabase/supabase-js` 설치
- `src/lib/supabase.ts` — 클라이언트 초기화 (브라우저용 + 서버용)
- 환경 변수 `.env.local` 설정

### 1.3 데이터베이스 스키마 생성
- Supabase SQL Editor에서 테이블 생성:
  - `museums` (id, name, address, lat, lng, category, hours, price, description, image_url, phone, website, target_age_min, target_age_max, created_at)
  - `programs` (id, museum_id FK, name, target_age, schedule, price, description)
  - `reviews` (id, museum_id FK, user_id FK, rating, content, child_age, created_at)
  - `favorites` (id, museum_id FK, user_id FK, created_at)
  - `visits` (id, museum_id FK, user_id FK, visited_at, memo, created_at)
  - `profiles` (id, user_id FK unique, nickname, children_info jsonb, region, created_at)
- RLS(Row Level Security) 정책 설정
  - reviews: 본인만 수정/삭제, 모두 읽기 가능
  - favorites: 본인만 CRUD
  - visits: 본인만 CRUD, 방문 횟수 집계는 모두 읽기 가능
  - profiles: 본인만 수정, 닉네임/방문 통계는 모두 읽기 가능

### 1.4 시드 데이터 준비
- 전국 주요 박물관 30~50개 JSON 데이터 수집
  - 국립중앙박물관, 국립과천과학관, 전쟁기념관, 국립민속박물관 등
  - 카테고리: 역사, 과학, 미술, 자연사, 어린이, 체험
- 교육 프로그램 데이터 (박물관당 1~3개)
- Supabase에 시드 데이터 INSERT

### 1.5 GitHub 리포지토리 생성
- `gh repo create museum-guide --public --source=. --push`
- `.env.local`을 `.gitignore`에 추가

---

## Phase 2: 핵심 기능 개발 (CRUD + UI)

### 2.1 레이아웃 & 네비게이션
- `src/app/layout.tsx` — 공통 레이아웃 (헤더, 네비게이션)
- 헤더: 로고, 메뉴(홈, AI추천, 즐겨찾기), 로그인 버튼
- 반응형 디자인 (모바일 우선)

### 2.2 메인 페이지 — 박물관 목록
- `src/app/page.tsx` — 박물관 카드 리스트
- 필터: 지역별 (서울, 경기, 부산 등), 카테고리별
- 검색: 박물관 이름 검색
- 카드 컴포넌트: 이미지, 이름, 카테고리, 평점, 입장료

### 2.3 카카오맵 연동
- 카카오 개발자 등록 + JavaScript 앱 키 발급
- `src/components/KakaoMap.tsx` — 지도 컴포넌트
- 박물관 마커 표시 (시드 데이터 좌표 사용)
- 마커 클릭 → 박물관 상세 이동

### 2.4 박물관 상세 페이지
- `src/app/museums/[id]/page.tsx`
- 기본 정보: 이름, 주소, 운영시간, 입장료, 전화, 웹사이트
- 교육 프로그램 목록 (대상 연령, 일정, 비용)
- 카카오맵 (해당 박물관 위치)
- 리뷰 섹션 (아래 2.6)

### 2.5 인증 (Supabase Auth) — 가산점
- `src/app/auth/page.tsx` — 로그인/회원가입 폼
- Supabase Auth 이메일 인증
- 로그인 상태 관리 (Context 또는 훅)
- 비로그인 시: 목록/상세 조회만 가능
- 로그인 시: 리뷰 작성, 즐겨찾기 추가 가능

### 2.6 리뷰 CRUD
- **Create**: 리뷰 작성 폼 (평점 1~5, 내용, 자녀 나이)
- **Read**: 박물관 상세에서 리뷰 목록 표시 (실시간)
- **Update**: 본인 리뷰 수정
- **Delete**: 본인 리뷰 삭제
- Supabase Realtime 구독 → 새 리뷰 실시간 반영 (가산점)

### 2.7 즐겨찾기
- 박물관 상세에서 하트 버튼 → 즐겨찾기 추가/제거
- 즐겨찾기 목록 페이지 (선택)

### 2.8 방문 기록 & 내 지도
- `visits` 테이블: museum_id, user_id, visited_at, memo
- 박물관 상세에서 "다녀왔어요" 버튼 → 방문일 + 메모 입력
- `src/app/my-map/page.tsx` — 내 방문 지도
  - 카카오맵에 방문한 박물관만 색상 마커로 표시
  - 방문 완료 마커(초록) vs 미방문 마커(회색) 구분
  - 방문 통계: 총 방문 수, 카테고리별 분포

### 2.9 가족 랭킹 (비교 기능)
- `profiles` 테이블: user_id, nickname, children_info, region
- `src/app/ranking/page.tsx` — 가족 랭킹 페이지
  - 방문 횟수 TOP 10 가족 리더보드
  - 카테고리 다양성 점수 (여러 분야 골고루 방문할수록 높음)
  - 내 순위 하이라이트
  - 닉네임으로 표시 (개인정보 보호)

---

## Phase 3: AI 추천 + 고급 기능

### 3.1 AI 맞춤 추천 — 가산점
- `src/app/recommend/page.tsx` — 추천 UI (두 가지 모드)
- **모드 1: 자녀 맞춤 추천**
  - 입력: 자녀 수, 각 자녀 나이, 관심 분야, 지역 선호
  - Claude가 맞춤 박물관 추천 + 추천 이유 + 관람 팁 생성
- **모드 2: 여행지 근처 추천**
  - 입력: 여행 목적지 (예: "경주", "제주")
  - 시드 데이터에서 해당 지역 근처 박물관 필터링
  - Claude가 여행 코스에 어울리는 박물관 추천 + 동선 제안
- `src/app/api/recommend/route.ts` — Claude API 호출
  - 시드 데이터 중 조건에 맞는 박물관을 context로 전달
- 추천 결과 카드 형태로 표시

### 3.2 Realtime 적용 — 가산점
- 리뷰 목록에 Supabase Realtime 구독
- 다른 사용자가 리뷰 작성 시 즉시 반영 (페이지 새로고침 불필요)

### 3.3 에러 처리
- API 호출 실패 시 사용자 친화적 에러 메시지
- 로딩 상태 표시 (스켈레톤 UI)
- 폼 유효성 검사 (빈 리뷰, 평점 미선택 등)
- 404 페이지 (존재하지 않는 박물관)

---

## Phase 4: 배포 + 마무리

### 4.1 Vercel 배포
- Vercel 계정 연동 (GitHub)
- 프로젝트 Import → 환경 변수 설정
- GitHub Push → 자동 배포 확인
- 커스텀 도메인 설정 (선택)

### 4.2 최종 점검
- 모든 CRUD 동작 확인
- 모바일 반응형 확인
- 카카오맵 정상 렌더링 확인
- AI 추천 동작 확인
- Realtime 동작 확인

### 4.3 결과 제출
- 배포 URL 텍스트 제출
- 주요 화면 스크린샷 캡처 (메인, 상세, AI추천, 리뷰)
- 앱 설명 작성

---

## 점수 목표

| 항목 | 배점 | 목표 |
|------|------|------|
| 기획서 (CLAUDE.md + plan.md) | 25점 | 25점 |
| 앱 개발 (CRUD + UI + 에러) | 35점 | 35점 |
| Vercel 배포 | 25점 | 25점 |
| 결과 제출 | 15점 | 15점 |
| 인증 (Supabase Auth) | +5점 | +5점 |
| AI 기능 (Claude API) | +5점 | +5점 |
| 실시간 (Realtime) | +5점 | +5점 |
| 외부 API (카카오맵) | +5점 | +5점 |
| **합계** | **120점** | **120점** |
