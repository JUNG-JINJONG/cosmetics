# B2B 플랫폼 네비게이션 메뉴 구조 (Menu List)

`frontend/src/components/layout/Navbar.tsx`의 `menuStructure` 정의를 바탕으로 구현된 플랫폼 탑 네비게이션 메뉴 구조입니다.

## 1. 홈 (Home)
*   **쇼룸 (`/partners`)**: 입점 업체 목록 및 상세 프로필 탐색
*   **대시보드 (`/dashboard`)**: 역할별 진행 현황 및 주요 지표 요약

## 2. 개발센터 (Development Center)
*   **개발 제안 (`/development/inquiries`)**: 바이어의 신규 개발 의뢰 및 제조사 수락 관리
*   **개발 진행 (`/development/projects`)**: 프로젝트 타임라인 및 단계별 진행률 모니터링

## 3. AI 컨설팅 (AI Consulting)
*   **AI 컨설턴트 (`/ai-rd/consulting`)**: 맞춤형 개발 전략 및 R&D 추천 리포트 (Gemini AI)
*   **AI 디지털 조색 (`/ai-rd/color`)**: Delta E 색차 계산 및 제품별 표준 색상 관리
*   **AI 포뮬러 랩 (`/ai-rd/library`)**: 지능형 제형 처방(Recipe) 및 성분 최적화 라이브러리

## 4. 매칭 및 거래 (Matching & Business)
*   **의뢰 (`/business/showroom`)**: 신제품 발주 및 견적 의뢰 (Showroom 연동)
*   **견적 (`/business/quotation`)**: MOQ 기반 단가 시뮬레이션 및 견적서 관리
*   **발주 (`/business/orders`)**: 공식 발주서(Purchase Order) 생성 및 주문 상태 트래킹
*   **정산 (`/business/settlement`)**: 글로벌 정산 내역 및 환율 데이터 요약
*   **AI 비즈니스 (`/business/copilot`)**: 매출 및 발주 데이터 기반 지능형 코파일럿 (Coco)

---

## 👤 사용자 프로필 메뉴 (User Profile Dropdown)
*   **마이페이지**: 개인 정보 및 계정 보안 설정
*   **소속 업체 관리**: 제조사/브랜드사 기업 정보 및 쇼룸 편집
*   **로그아웃**: 로컬 스토리지 세션 초기화 및 홈으로 이동
