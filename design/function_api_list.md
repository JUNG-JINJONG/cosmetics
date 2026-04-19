# B2B 플랫폼 기능 명세 및 API 매핑 현황

이 문서는 `function-summary.md`의 기능 목록과 현재 `backend/app/api/`에 구현된 실제 API 엔드포인트를 매핑한 리스트입니다. 모든 경로는 `/api/v1`을 Base URL로 사용합니다.

---

## 1. 계정 및 업체 관리 (Account & Company Management)

| 기능 | API 경로 | 메서드 | 구현 상태 |
| :--- | :--- | :---: | :--- |
| **바이어 회원가입** | `/account/signup` | POST | ✅ 완료 |
| **바이어 로그인** | `/account/login` | POST | ✅ 완료 |
| **바이어 내 정보 조회** | `/account/me` | GET | ✅ 완료 |
| **기업 전체 목록 조회** | `/account/auth/companies` | GET | ✅ 완료 |
| **기업 상세 정보 조회** | `/account/auth/companies/{id}` | GET | ✅ 완료 |
| **디지털 쇼룸 정보 조회** | `/account/auth/companies/{id}/showroom` | GET | ✅ 완료 |
| **파트너 평점 등록/조회** | `/account/auth/companies/{id}/ratings` | POST/GET | ✅ 완료 |
| **기업 사용자(직원) 가입/로그인** | `/account/company-users/signup\|login` | POST | ✅ 완료 |
| **기업 사용자 내 정보 조회** | `/account/company-users/me` | GET/PATCH | ✅ 완료 |

---

## 2. ODM/OEM/OBM 개발 워크플로우 (Development Workflow)

| 기능 | API 경로 | 메서드 | 구현 상태 |
| :--- | :--- | :---: | :--- |
| **원스톱 개발 의뢰 (Inquiry)** | `/workflow/inquiries` | POST/GET | ✅ 완료 |
| **의뢰 상세 및 수락(Accept)** | `/workflow/inquiries/detail\|accept` | GET/POST | ✅ 완료 |
| **상세 문진 매핑 (N:M)** | `/workflow/inquiry-questions` | POST | ✅ 완료 |
| **문진 항목 수정/삭제** | `/workflow/inquiry-questions/update\|delete` | PATCH/DEL | ✅ 완료 |
| **프로젝트 목록 및 초기화** | `/workflow/projects` | GET/POST | ✅ 완료 |
| **프로젝트 상태/진행률 업데이트** | `/workflow/projects/update` | PATCH | ✅ 완료 |
| **제조사 상세 제안 및 수락** | `/workflow/projects/proposal\|confirm` | POST | ✅ 완료 |
| **프로젝트 타임라인 조회** | `/workflow/projects/timeline` | GET | ✅ 완료 |
| **패키징 라이브러리 관리** | `/workflow/packages` | GET/POST/.. | ✅ 완료 |
| **제제 샘플 생성 및 목록** | `/workflow/samples` | POST/GET | ✅ 완료 |
| **제제 5대 감각 품평(Review)** | `/workflow/samples/reviews/create` | POST | ✅ 완료 |
| **생산 공정 상세 현황** | `/workflow/progress/detail\|update` | GET/PATCH | ✅ 완료 |
| **적합성 테스트(C/T) 관리** | `/workflow/compatibility-tests` | POST/GET/.. | ✅ 완료 |
| **글로벌 컴플라이언스 가이드** | `/workflow/compliance-rules` | POST/GET/.. | ✅ 완료 |

### 2C. 품질 관리 및 CoA (QC & CoA)
| 기능 | API 경로 | 메서드 | 구현 상태 |
| :--- | :--- | :---: | :--- |
| **QC 마스터 및 항목 초기화** | `/workflow/qc/` \| `/items/initialize` | POST | ✅ 완료 |
| **QC 검사 결과 기록 (개별/일괄)** | `/workflow/qc/items/result\|batch-results` | PATCH | ✅ 완료 |
| **디지털 CoA 발행 및 조회** | `/workflow/qc/coa/issue-report\|report` | POST/GET | ✅ 완료 |
| **최종 출하 승인 요청 및 승인** | `/workflow/qc/outbound` \| `/outbound-update` | POST/PATCH | ✅ 완료 |

---

## 3. AI 기반 R&D 혁신 (AI & R&D Innovation)

| 기능 | API 경로 | 메서드 | 구현 상태 |
| :--- | :--- | :---: | :--- |
| **AI 처방 성분 추천** | `/ai-rd/recipe-recommend` | POST | ✅ 완료 |
| **스마트 AI 컨설팅 리포트** | `/ai-rd/smart-consulting` | POST | ✅ 완료 |
| **디지털 색차(Delta E) 계산** | `/ai-rd-color/calculate-delta-e` | POST | ✅ 완료 |
| **표준 색상 및 측정 로그 관리** | `/ai-rd-color/masters\|measurements` | POST/GET | ✅ 완료 |
| **R&D 제형 레시피 라이브러리** | `/ai-rd/library/recipes` | POST/GET/.. | ✅ 완료 |
| **원료 효능 및 독점 자산 관리** | `/ai-rd/library/efficacies\|exclusive` | POST/GET/.. | ✅ 완료 |
| **AI R&D 상담 (Chat)** | `/ai-rd/consulting/chat` | POST | ✅ 완료 |
| **상담 세션 및 전략 브리프 생성** | `/ai-rd/consulting/sessions` | GET/POST | ✅ 완료 |

---

## 4. 비즈니스 거래 및 인텔리전스 (Business & Intelligence)

| 기능 | API 경로 | 메서드 | 구현 상태 |
| :--- | :--- | :---: | :--- |
| **스마트 견적 목록 및 상세** | `/business/quotations/` \| `/detail` | GET | ✅ 완료 |
| **자동 견적 생성 및 수정** | `/business/quotations/` \| `/update` | POST/PATCH | ✅ 완료 |
| **가격 시뮬레이션 및 티어링** | `/business/quotations/simulate-price\|price-tiers` | POST | ✅ 완료 |
| **발주(Order) 전환 및 목록** | `/business/orders/convert-from-quotation` \| `/` | POST/GET | ✅ 완료 |
| **글로벌 정산 생성 및 조회** | `/business/settlements/generate` \| `/` | POST/GET | ✅ 완료 |
| **생산 일정 및 배송 정보 관리** | `/business/factory/schedules\|shipments` | POST/GET/.. | ✅ 완료 |
| **제조사 쇼룸 검색 및 상세** | `/business/partners/` \| `/{id}` | GET | ✅ 완료 |
| **AI 비즈니스 코파일럿(Coco) 대화** | `/business/copilot/chat` | POST | ✅ 완료 |
| **실시간 비즈니스 KPI 메트릭** | `/business/copilot/metrics` | GET | ✅ 완료 |

---

## 5. 지표 및 정보 서비스 (Dashboard & Insights)

| 기능 | API 경로 | 메서드 | 구현 상태 |
| :--- | :--- | :---: | :--- |
| **역할 기반 홈 대시보드 요약** | `/dashboard/summary` | GET | ✅ 완료 |
| **글로벌 인사이트 리포트** | `/support/insights/reports` | GET/POST | ✅ 완료 |
| **트렌드 키워드 및 의미(Vector) 검색** | `/support/insights/trends\|/search` | GET/POST | ✅ 완료 |
| **시장 통계 데이터 관리** | `/support/insights/statistics` | GET/POST | ✅ 완료 |
