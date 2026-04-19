# B2B 플랫폼 구현 화면 목록 (View List)

`frontend/src/app` 디렉토리의 실제 페이지 구조(`page.tsx`)를 기반으로 한 구현 완료 화면 목록입니다.

## 1. 홈 및 대시보드 (Core)
*   **랜딩 페이지 (`/`)**: 서비스 소개 및 핵심 가치 제안
*   **통합 대시보드 (`/dashboard`)**: 역할별(바이어/제조사) 주요 프로젝트 현황 및 KPI 지표 시각화
*   **권한 가드 메세지 (`/auth/login-required`)**: 비로그인 사용자의 접근 제한 알림

## 2. 업체 및 파트너 관리 (Partners)
*   **제조사 쇼룸 목록 (`/partners`)**: 검색 및 카테고리 필터 기반 파트너사 탐색
*   **제조사 상세 프로필 (`/partners/[id]`)**: 업체별 히어로 섹션, 보유 역량, 포트폴리오(Showroom) 전시

## 3. 개발 워크플로우 (Development Flow)
*   **신규 개발 의뢰 (`/development/new-inquiries`)**: 원스톱 의뢰서 작성을 위한 위자드 환경
*   **의뢰 관리 목록 (`/development/inquiries`)**: 내 의뢰 및 수신 의뢰 진행 상태 목록
*   **의뢰 및 상세 문진 (`/development/inquiries/[id]`)**: 15대 감각 지표 매핑 정보를 포함한 의뢰 상세 현황
*   **제조사 상세 제안 (`/development/inquiries/[id]/proposal`)**: 프로젝트 참여를 위한 처방 제안 및 견적 입력
*   **프로젝트 트래킹 (`/development/projects`)**: [기획-제안-생산-물류] 전 과정 타임라인 모니터링

## 4. AI 기반 R&D 혁신 (AI & R&D Center)
*   **AI 컨설팅 허브 (`/ai-rd/consulting`)**: Gemini AI 기반 맞춤형 개발 전략 상담 및 멀티턴 채팅
*   **디지털 컬러 랩 (`/ai-rd/color`)**: CIELAB 기반 델타 E 색차 계산 및 제품별 표준 색상 관리
*   **R&D 자산 라이브러리 (`/ai-rd/library`)**: 제형 레시피, 원료 효능 매핑 데이터 라이브러리

## 5. 비즈니스 거래 및 인텔리전스 (Business & Intelligence)
*   **비즈니스 매칭 (`/business/showroom`)**: 제품 중심의 비즈니스 매칭 및 견적 요청
*   **견적 관리 (`/business/quotation`)**: 수량별 MOQ 시뮬레이션 및 견적서 상태 트래킹
*   **견적 수동 생성 (`/business/quotation/new`)**: 견적 항목 및 수령인 지정을 통한 실무용 견적 생성
*   **발주 관리 (`/business/orders`)**: 견적 승인 기반 정식 발주서(PO) 리스트 및 배송 상태 추적
*   **정산 대시보드 (`/business/settlement`)**: 수수료/부가세 분리 계산된 정산 내역 및 글로벌 가격 요약
*   **AI 비즈니스 코파일럿 (`/business/copilot`)**: 실시간 비즈니스 데이터(매출 등) 기반 지능형 분석 및 상담

---

## 📂 Next.js Routing Map (Actual)
현재 구현된 `frontend/src/app` 폴더의 실제 라우팅 구조입니다.

```text
src/app/
├── (core)/
│   ├── page.tsx            # 랜딩
│   └── dashboard/          # 대시보드
├── partners/               # 쇼룸 및 제조사 프로필
├── development/            # 개발 의뢰, 제안, 프로젝트 관리
├── ai-rd/                  # AI 컨설팅, 컬러 랩, 라이브러리
├── business/               # 견적, 발주, 정산, 코파일럿
└── auth/                   # 권한 제한 및 인증 프로세스
```
