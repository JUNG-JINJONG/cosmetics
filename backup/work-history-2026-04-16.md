

# Cosmetics-B2B 프로젝트 작업 이력 (Work History)

## [2026-04-13] 출하 승인 기능 완성 및 전사 API 라우팅 구조 대개편
- **출하 승인(Outbound Approval) 워크플로우 구현**:
    - 제조사의 출하 요청 및 바이어의 최종 승인/발송 지시 기능 완성.
    - `category` 테이블 연동으로 품질/정산 상태 코드 자동 관리 로직 구현.
- **라우팅 충돌 버그(422 Unprocessable Entity) 근본 해결**:
    - 동적 경로(`/{id}`)가 고정 경로를 가로채는 현상을 분석하여 해결.
- **전사 API 아키텍처 리팩토링 (Static-First Policy)**:
    - `Quotation`, `Settlement`, `QC`, `Production`, `Sample` 모듈의 모든 동적 루트 경로를 고정 경로(`/detail`, `/update` 등)로 개편.
    - 파라미터 전달 방식을 쿼리 스트링(`?id=...`)으로 통일하여 경로 충돌 가능성을 원천 차단.
- **프론트엔드 컴포넌트 동기화**:
    - `OutboundTab`, `QualityControlTab`, `SamplingTab`, `ProductionTab` 등 주요 탭의 API 호출부 전면 수정.

## 📅 작성일: 2026-03-24 (Update)

### 프로젝트 핵심 파트너
*   **사용자**: 정부장 (General Manager Jeong)
*   **AI 어시스턴트**: 코코 (Coco)

### 지금까지 완료된 작업

1.  **백엔드 기반 구조 구축**
    *   `backend/` 디렉토리 생성 및 초기 프로젝트 구조 설계.
    *   `backend/app/main.py`에 기본적인 FastAPI 서버 코드 작성.

2.  **64비트 개발 환경 구성 (Python 3.12)**
    *   기존 32비트 환경의 한계(`pgvector` 등 일부 바이너리 설치 불가)를 해결하기 위해 **Python 3.12 64-bit (Embeddable)** 버전을 `backend/python64`에 직접 설치.
    *   `python312._pth` 수정 및 `pip` 설치를 통해 독립적인 패키지 관리 환경 구축.
    *   기존 32비트 가상환경(`.venv`) 제거 후 64비트 환경으로 통합.

3.  **핵심 라이브러리 설치 완료**
    *   `fastapi`, `uvicorn[standard]` (웹 서버)
    *   `sqlalchemy`, `psycopg2-binary` (PostgreSQL 연동)
    *   `pydantic-settings`, `python-dotenv` (환경 변수 관리)
    *   `mcp`, `fastmcp` (AI MCP 연동 SDK)
    *   `backend/requirements.txt` 최신화.

4.  **데이터베이스 인프라 설계 및 협의**
    *   RAG 기능을 위한 **`pgvector`** 확장 지원 PostgreSQL 도입 결정.
    *   시스템 오염 방지 및 설치 편의성을 위해 **Docker** 기반 구축 합의.
    *   데이터 저장 경로를 `e:\Cosmetics-B2B\postgres_data`로 확정.

5. **Docker 및 데이터베이스 환경 구축 완료**
    *   WSL 2 및 Docker Desktop 설치 및 연동 완료 (Ubuntu-24.04).
    *   `docker-compose.yml` 및 `.env` 파일 작성 및 설정 완료.
    *   `pgvector/pgvector:pg16` 이미지 기반 DB 컨테이너 기동 (`cosmetics_db_container`).
    *   데이터베이스 내부 `vector` 확장(Extension) 활성화 완료.

6. **주요 화장품 B2B/ODM 벤치마킹 분석 완료**
    *   한국콜마, 코스맥스 플러스, UMMA, 코스메카코리아 4개 사이트 정밀 분석.
    *   각 플랫폼별 기능 목록(`function-list-01~04`) 및 테이블 설계안(`table-list-01~04`) 작성 완료.
    *   '제조 AI'와 '중개 플랫폼 AI'의 차이점 및 우리 프로젝트의 방향성(똑똑한 중개소) 정립 및 `project-concept-complement.txt` 기록 완료.

7. **기업 정보 관리(`company`) 및 카테고리(`Category`) 구축 완료**
    *   플랫폼 참여 기업 정보를 관리하기 위한 `company`(단수형) 테이블 추가.
    *   `inquiries`(의뢰) 및 `brands`(브랜드) 테이블과 `company_id`를 통한 외래 키(FK) 관계 연결 완료.
    *   계층형 그룹 코드 구조를 가진 `Category` 테이블 신규 생성 (Group Code 1~4 및 코드/설명 포함).
    *   사업자 등록번호 중복 체크 및 주력 분야, 인증 정보(JSONB) 등 상세 컬럼 반영.

---

### 진행 중인 작업 (Pending)

*   **스마트 관제탑 구조 완성 (Inquiry Detail)**: 상세 페이지를 7개 이상의 스마트 탭으로 분리하여 유지보수성을 확보하고, 샘플링 및 생산 관리를 통합 완료.

---

### 2026-03-23 작업 상세
*   **벡터 DB 기술 검토**: `pgvector` 외 전용 벡터 DB(Pinecone, Milvus 등) 및 클라우드(Neon, Supabase) 대안 검토.
*   **인프라 결정**: 윈도우 네이티브 설치의 복잡성을 고려하여 기존 Docker 기반 `pgvector` 환경을 그대로 유지하기로 최종 합의.
*   **스키마 통합 시도**: 4개 벤치마킹 사례(`table-list-01~04`)를 하나로 통합한 스키마 구조 설계 및 SQL 작성 (익일 상세 구체화 예정).

---

### 2026-03-24 작업 상세
*   **테이블 명칭 단수화 및 정비**: 모든 테이블 명칭을 사용자 요청에 따라 단수형(`company`, `Category`)으로 통일 및 `db-schema.sql` 반영.
*   **계층형 카테고리 구현 및 데이터 삽입**: 4단계 그룹 코드 체계를 갖춘 `Category` 테이블을 스키마에 추가하고, 사용자가 제공한 15가지 사용 속성(Sensory Attributes) 데이터를 성공적으로 삽입.
*   **카테고리 코드 체계 변경 및 정규화**: `group_code1`을 10으로, `group_code2`를 10번대(10, 11, 12, 13)로 일괄 변경. 미사용 코드 필드(`group_code3`, `group_code4`)의 `NULL`값을 `'00'`으로 업데이트하고 스키마에 `DEFAULT '00'`을 설정하여 가독성과 데이터 정합성 확보.
*   **감각적 속성(`sensory_attribute`) 테이블 구축**: 제품의 향, 질감 등을 관리하기 위한 전용 테이블을 생성하고 문서에 반영.
*   **글로벌 제품 데이터셋 임포트(1,472건)**: `Cosmetics-product_dataset.zip`을 분석하여 글로벌 브랜드와 제품 데이터를 DB에 이식.
    *   중복 방지 및 FK 정합성을 위해 10개의 가상 지배 기업(Global Beauty Group)을 자동 생성하여 연결.
    *   116개의 브랜드와 1,472개의 상세 제품(성분, 가격, 랭킹 포함) 정보 구축 완료.
*   **DB 마이그레이션 실행 및 문서 동기화**: `Category` 테이블에 `code_name` 영문 컬럼을 추가하고, 모든 변경 사항을 `db-schema.sql` 및 `table-summary.md` 등에 즉시 반영.
*   **테이블 명칭 표준화 최종 완료**: 사용자의 편의를 위해 대소문자를 구분하던 `"Category"` 테이블을 소문자 `category`로 변경하고, 관련 외래 키 및 스키마 정의를 모두 최신화.
*   **감각 벡터(`trend_vector`) 구현 및 AI 검색 검증**: 
    *   `product` 테이블에 15차원 `trend_vector` 컬럼을 추가하고, `sensory_attribute` 점수 데이터를 집계하여 제품별 감각 프로필 벡터를 생성(1,472건).
    *   `pgvector`의 코사인 유사도(`<=>`) 연산을 활용하여 "밀착력이 좋은 제품" 등 자연어 요구사항에 맞는 제품 추천 기능의 동작을 성공적으로 검증.
*   **AI 비즈니스 코파일럿(Copilot) 명세 수립**: 
    *   단순 제품 검색을 넘어 제품 개발, 생산, 물류, 정산 등 전체 비즈니스 프로세스의 상태를 AI 채팅으로 실시간 조회할 수 있도록 기능을 확장 설계.
*   **플랫폼 설계 문서(Blueprint) 구축 완료**: 
    *   통합 기능 명세서(`function-summary.md`) 및 주요 화면 목록(`view_list.md`) 작성을 통해 개발을 위한 모든 준비 단계 완료.

---

### 2026-04-07 작업 상세 (Windows to Mac Migration)
*   **프로젝트 환경 이관**: 윈도우(Windows) 기반 개발 환경에서 맥(MacOS, Apple Silicon) 환경으로 프로젝트 폴더 전체 이식 및 경로 최신화.
*   **Docker DB 컨테이너 기동**: `docker-compose up -d`를 통해 `cosmetics_db_container` (pg16 + pgvector) 정상 실행 확인.
*   **백업 데이터(`backup.sql`) 임포트 및 트러블슈팅**: 
    *   **문제 발생**: 윈도우에서 생성된 백업 파일이 `UTF-16LE` 인코딩 및 `BOM`을 포함하고 있어 `psql` 임포트 시 문자셋 에러(`invalid byte sequence`, `0xff`) 발생.
    *   **해결 과정**: `iconv`를 통한 `UTF-8` 변환 및 `tail` 명령어를 이용한 `BOM` 제거(`backup_final.sql` 생성) 시도.
    *   **최종 해결**: Homebrew를 통해 맥용 `postgresql` 클라이언트 툴을 설치하고, **DBeaver**의 `Restore database` 기능을 활용하여 인코딩 충돌 없이 데이터 복구 완료.
*   **데이터 무결성 및 인코딩 검증**: 임포트 완료 후 `category`, `product` 등 주요 테이블의 한글 데이터가 깨짐 없이 정상적으로 조회됨을 최종 확인.

---

### 2026-04-08 작업 상세
*   **Mac 전용 가상환경 구축**: `python3.12`를 사용하여 백엔드 가상환경(`.venv`) 생성 및 라이브러리 설치 완료.
*   **서버 구동 확인**: `uvicorn app.main:app --reload` 명령어를 통해 FastAPI 서버가 정상적으로 실행됨을 확인 (`/health` 엔드포인트 응답 확인).
*   **API 모듈 구조 설계 및 생성**: `function-summary.md`의 6개 핵심 기능을 기반으로 `app/api/` 하위에 도메인별 폴더(account_company, development_workflow, ai_rd 등) 및 초기 라우터 파일 생성 완료.
*   **보안 및 업체 관리 (1단계) 백엔드 구현**:
    *   JWT 기반 인증 및 **Role-Based Access Control(RBAC)** 구현 (Admin, Manufacturer, Client 등급 분리).
    *   업체 스펙 및 보유 브랜드를 한곳에서 모아보는 **디지털 쇼룸 통합 조회 API** 구현.
    *   **파트너 레이팅 (`partner_ratings`)**: 테이블 스키마 설계, 모델 적용, 별점/의견 조회 CRUD API 추가.
*   **ODM/OEM 개발 워크플로우 (2단계) 시스템 완성**:
    *   **원스톱 의뢰 (`inquiries`)**: `cosmax_pkg_item_id`를 일반 컬럼으로 연결하고 관련 모델/스키마 확정.
    *   **상세 문진표 매핑 (`inquiry_questions`)**: `category` 테이블과 의뢰서를 N:M으로 다대다 연결하는 매핑 구조 신규 도입 및 API CRUD 완비.
    *   **문진 기초 데이터 확보 (`category`)**: 타겟 효능, 컨셉 성분, 텍스처, 피부 타입(group_code1=12~15) 데이터 SQL 추가 및 Database 인서트 완료.
    *   **패키징 라이브러리 관리 (`cosmax_pkg_items`)**: 관리자용 자재 등록, 수정, 삭제(CRUD) API 추가.
    *   **적합성 테스트 (C/T) (`compatibility_tests`)**: 용기와 제형의 매칭 점검을 위한 신규 테이블 설계, Pydantic 검증 및 백엔드 CRUD API 구현.
    *   **글로벌 컴플라이언스 가이드 (`compliance_rules`)**: 미국, 중국 등 각국 배합 금지 성분 관리 테이블 신설 및 Admin 관리용 전체 CRUD API 구현 완료.
*   **AI 기반 R&D 혁신 (3단계) 인프라 및 API 구축**:
    *   **원료 마스터 DB (`ingredients`)**: CDPH 데이터를 파싱하여 122개의 핵심 화학 성분 및 CAS 번호 이식 완료.
    *   **감각 지표 고도화**: `product_sensory_attribute`로 테이블명 최적화 및 원료별 감각 지표(`ingredients_sensory_attribute`) 데이터 1,830건 생성.
    *   **벡터 검색 가동**: `ingredients_vector`(15차원)를 생성하여 `pgvector` 기반 코사인 유사도 검색 로직 구현.
    *   **제미나이(Gemini 2.5 Flash) 연동**: 사용자의 자연어 요청을 벡터로 변환하고 성분 추천 및 연구원 가이드 설명을 생성하는 `AIService` 구현.
    *   **추천 API 완성**: `POST /api/v1/ai-rd/recipe-recommend` 엔드포인트 구현 및 시뮬레이션 검증 완료.

---

### 2026-04-09 작업 상세
*   **프로젝트 구조 고도화 및 폴더 정리**:
    *   **설계/문서 (`design/`)**: `db-schema.sql`, 기획 Markdown, 컨셉 파일들을 모아 설계 자산화.
    *   **데이터 자산 (`data/`)**: 대용량 원본 데이터(ZIP, CSV) 및 대형 임포트용 SQL 파일 격리.
    *   **DB 관리 (`sql/`)**: 마이그레이션 scripts, 백업(`backup.sql`), 데이터 검증 SQL 파일들을 통합 관리.
    *   **운영 스크립트 (`scripts/`)**: DB 초기화, 데이터 임포트, AI 테스트 등 파이썬 유틸리티 스크립트들을 별도 분리.
    *   **백엔드 로직 (`backend/`)**: 순수 애플리케이션 소스 코드 및 가상환경 중심으로 정비.
*   **스크립트 경로 최적화**: 
    *   `scripts/` 폴더 내 모든 `.py` 파일(5종)의 내부 경로 로직을 수정하여 프로젝트 루트, 백엔드 모듈, 데이터 파일을 정확히 참조하도록 업데이트 완료.
*   **디지털 조색 및 색상 측정 API 구현**:
    *   **데이터 모델 (`models/color.py`)**: `ColorMaster`, `ColorMeasurementLog` 모델 정의 및 `Product`, `Project`와 관계 설정.
    *   **색차 계산 서비스 (`services/color_service.py`)**: CIELAB(CIE76) 공식을 활용한 **Delta E($\Delta E$) 실시간 계산** 및 합격 여부(Tolerance) 판정 로직 구현.
    *   **REST API (`api/ai_rd/color_routes.py`)**: 
        *   표준 색상 등록/조회(CRUD).
        *   실시간 색상 측정 및 오차 로그 기록 API.
        *   DB 저장 없이 즉시 색차를 계산하는 유틸리티 엔드포인트 추가.
    *   **라우터 등록**: `/api/v1/ai-rd/color` 경로로 전체 API 통합 완료.
*   **R&D 상세 데이터 라이브러리 테이블 구축**:
    *   **제형 상세 레시피 (`formula_recipes`)**: 자산별 원료 배합 비율 및 공정 단계(Phase) 관리 테이블 추가.
    *   **원료 효능 매핑 (`ingredient_efficacies`)**: 원료별 정밀 효능(미백, 주름 등) 및 근거 수준 관리 테이블 추가.
    *   **독점 자산 관리 (`exclusive_assets`)**: 업체별/지역별 자산 독점권 및 소유권 관리 테이블 추가.
*   **R&D 데이터 라이브러리 풀(Full) CRUD API 구현**:
    *   **데이터 모델 (`models/rd_library.py`, `models/ingredient.py`)**: `CosmaxRAndDAsset`, `Ingredient` 및 신규 3개 테이블의 SQLAlchemy 모델 구현.
    *   **Pydantic 스키마 (`schemas/rd_library.py`)**: 생성/조회/수정 전용 스키마 완비.
    *   **서비스 로직 (`services/rd_service.py`)**: 제형 레시피, 원료 효능, 독점 권한 관리를 위한 **생성, 조회, 수정, 삭제(CRUD)** 전체 기능 구현.
    *   **REST API (`api/ai_rd/rd_routes.py`)**: `/api/v1/ai-rd/library` 경로 하위에 GET, POST, PATCH, DELETE 엔드포인트 완비.
*   **스마트 문진 시스템 및 AI 추천 엔진 고도화**:
    *   **컨설팅 서비스 (`services/consulting_service.py`)**: 특정 `inquiry_id`의 문진 결과 점수를 분석하고, R&D 라이브러리와 매핑하여 최적의 추천 데이터를 추집하는 로직 구현.
    *   **AI 코파일럿 강화 (`services/ai_service.py`)**: 단순 성분 검색을 넘어, 문진 데이터와 R&D 자산을 종합 분석하여 **'제품 개발 전략 리포트'**를 자동 생성하는 프로모팅 로직 추가.
    *   **스마트 컨설팅 API (`api/ai_rd/routes.py`)**: `/api/v1/ai-rd/smart-consulting` 엔드포인트 신설. 고객 요구사항에 딱 맞는 베이스 제형, 핵심 성분, 마케팅 포인트를 한 번에 제공.
*   **AI 매칭 알고리즘 정교화 및 결과 저장 구현**:
    *   **가중치 기반 스코어링**: 문진 항목 중 '효능(Efficacy)' 카테고리에 2배의 가중치를 부여하도록 로직 고도화.
    *   **R&D 자산 랭킹 시스템**: 문진 키워드와 자산의 `trend_tags`를 매핑하여 유사도 점수를 계산하고 상위 후보를 추출하는 알고리즘 적용.
    *   **컨설팅 이력 저장 (`consulting_reports`)**: 생성된 AI 리포트 전문과 당시 사용된 매칭 점수를 DB에 영구 저장하여 히스토리 관리 가능하도록 구현.
    *   **데이터 모델 추가**: `ConsultingReport` 모델을 통해 AI 컨설팅 결과의 영속성 확보.
*   **비즈니스 거래 및 트래킹 (스마트 견적 및 생산 인프라)**:
    *   **스마트 견적 시스템 (`quotations`, `quotation_items`)**:
        *   발주 전 단계의 정밀 견적 이력 관리 시스템 구축 및 **Full CRUD API** 완비.
        *   **자동 단가 산출 엔진 (`PricingService`)**: MOQ(최소주문수량) 가격 티어링 정책을 실시간으로 반영하여 최적가 자동 계산.
        *   **할인 관리 고도화**: 항목별 할인율(`discount_rate`) 및 할인금액(`discount_amount`) 반영 로직 구현 및 전체 합계 자동 동기화.
    *   **생산 및 물류 트래킹 인프라 (`production_schedules`, `shipments`)**:
        *   **생산 공정 관리**: 배치 번호, 생산 라인 배정, 시작/종료 일정 트래킹 시스템 구축 및 **Full CRUD API** 완비.
        *   **물류 및 출고 관리**: 송장 번호 연동 및 배송 상태(`In-Transit`, `Delivered` 등) 추적 기반 마련 및 **Full CRUD API** 완비.
    *   **데이터 모델링 및 무결성**: 주문(`orders`)을 중심으로 한 견적-생산-물류 간의 1:N 관계 정의 및 데이터 스냅샷(견적가 불변성) 확보.
*   **실시간 대시보드 및 품질 관리(QC) 인프라 구축**:
    *   **카테고리 고도화**: `code_name`을 `code_name_kr`, `code_name_eng`로 분리하고 정규표현식으로 기존 데이터 정제 완료.
    *   **프로젝트 타임라인 (`project_status_logs`)**: 프로젝트 상태 변경 시 자동으로 이력을 남기는 로깅 시스템 및 타임라인 조회 API 구현.
    *   **품질 관리 시스템 (`quality_controls`)**: 생산 단계와 연동된 품질 검사 결과 기록 테이블 구축 및 CRUD API 완비.
    *   **표준 코드 정립**: 프로젝트 상태(10단계), 품질 상태(6단계)에 대한 계층형 코드 데이터(Group 13, 14) 삽입 완료.
    *   **가격 티어 CRUD**: 제조사가 직접 수량별 단가(Price Tiering)를 관리할 수 있는 API를 추가하여 '유연한 MOQ 대응' 기능 완성.

---

### 2026-04-10 작업 상세
*   **플랫폼 기능 범위 최적화 (Priority Adjustment)**:
    *   **글로벌 물류 및 재고 관리 (5단계) 전략 수정**: 외부 시스템(U-Quick, MES 등)과의 실시간 API 연동은 차기 단계로 연기하되, 플랫폼 내독립적으로 구현 가능한 **핵심 비즈니스 로직(Internal Logic)**은 우선순위를 높여 진행하기로 함.
*   **AI 파트너 페르소나 설정**:
    *   **애칭 확정**: 프로젝트의 성공적인 협업을 위해 AI 코딩 어시스턴트의 애칭을 **'코코(Coco)'** (Cosmetics Copilot의 약자)로 확정 및 기록.
*   **글로벌 정산 인프라 구축 및 표준 가이드 수립**:
    *   **DB 스키마 확장**: `exchange_rates`(환율 관리) 및 `settlements`(최종 정산 내역) 테이블 설계 및 생성 완료.
    *   **SQL 명명 규칙 가이드 수립**: `design/sql-convention.md` 파일을 생성하여 `_status_code` 형식 및 `VARCHAR(10)` 타입 사용 등 프로젝트 표준 SQL 규칙 정의.
    *   **기존 테이블 정규화**: `settlements` 테이블의 상태 컬럼을 규칙에 따라 `settlement_status_code`로 변경 완료.
    *   **공통 코드 정립**: 정산 상태 관리를 위한 공통 코드 그룹(15: 정산상태) 및 상세 상태값 7건을 `category` 테이블에 등록 완료. (프로젝트 표준에 맞춰 순번을 **01부터 시작**하도록 정규화 완료)
    *   **데이터 정합성 확보**: 주문(`orders`)과 연동된 세금, 수수료, 실 정산액(Net Amount) 계산 기반 마련.

## 2026-04-10 (현재)
*   **SQL 명명 및 코드 규칙 고도화 (By 코코)**
    *   **코드 체계 정립**: `category` 테이블의 `code` 생성 규칙을 `group_code1-4 || '순번'` 결합형으로 확정.
    *   **공통 코드 정규화**: 정산 상태 그룹(15)을 `01`(마스터)부터 시작하는 표준 체계로 재등록 및 가이드 반영.
*   **글로벌 가격 및 정산 엔진 구현 (Level 1 가시화)**
    *   **스마트 가격 시뮬레이션**: 수량별 MOQ 단가 자동 계산 및 환율 변환, 차상위 티어 절감액 제안 로직 구현 (`PricingService`).
    *   **정산 자동화 시스템**: 주문 완료 시 세금/수수료 공제 및 통화 변환을 거쳐 `settlements` 데이터를 생성하는 로직 구현 (`SettlementService`).
    *   **REST API 확장**: 시뮬레이션 및 글로벌 정산 관리를 위한 신규 엔드포인트 노출 완료.
*   **품질 관리(QC/QA) 프로세스 고도화 (Trust & Quality)**
    *   **QC 데이터 구조 혁신**: `product_qc_specs`(표준 규격) 및 `qc_items`(상세 시험 결과) 테이블 및 모델 구축.
    *   **자동 판정 엔진 구현**: 입력 수치와 표준 규격을 비교하여 합격/불합격을 자동으로 판정하는 `QCService` 로직 구현.
    *   **QC 전용 API 라우터 분리**: 규격 등록, 항목 자동 초기화, 결과 입력 및 판정 API 구축 (`qc_routes.py`).
*   **정보 서비스 및 인사이트 인프라 구축 (Intelligence & Insights)**
    *   **인사이트 리포트 시스템**: 시장 트렌드 분석 리포트 발행 및 조회 기능 구현 (`InsightReport`).
    *   **벡터 기반 트렌드 추적**: `trend_keywords`에 **`pgvector`**를 적용하여 의미 검색 지원. **다중 성분/상품 연계(N:N)**를 위해 배열 필드 적용.
    *   **시장 통계 시각화 데이터**: `JSONB` 유연한 데이터 구조를 가진 `market_statistics` 테이블 및 API 개발.
    *   **전문 명칭 도입**: 리포트 분류를 `insight_pillars_code`로, 상태 값을 `status_code`로 전문화하여 시스템 정체성 확립.
    *   **공통 코드 데이터 구축**: Group 17(인사이트 필라) 데이터 7종을 `category` 테이블에 성공적으로 등록.
*   **AI 지능형 비즈니스 코파일럿 인프라 구축 (AI Copilot)**
    *   **상담 세션 및 메시지 관리**: 지속 가능한 상담을 위한 `ai_chat_sessions`, `ai_chat_messages` 테이블 및 백엔드 CRUD 구현.
    *   **컨설팅 브리프 엔진**: 상담 결과를 전략 리포트로 도출하는 `ai_consulting_briefs` 인프라 구축.

---

### 2026-04-11 작업 상세
*   **기술 문서 정규화 및 정리**:
    *   `function_api_list.md` 및 `tech_stack.md`를 `design/` 폴더로 이동하여 문서 자류 체계화.
    *   중복 내용인 `development-environment.md`를 삭제하고, 핵심 인프라 및 아키텍처 정보를 `tech_stack.md`로 통합.
*   **개발 환경 최적화 (Node.js)**:
    *   Homebrew를 통해 **Node.js v20 (LTS)** 설치 및 환경 변수(`.zshrc`) 등록.
    *   최신 프레임워크(Next.js 16) 요구사항에 맞춘 런타임 환경 조성.
*   **프론트엔드 프로젝트 초기화 및 핵심 라이브러리 구축**:
    *   **Next.js 16 (App Router)** 기반의 프론트엔드 프로젝트(`frontend/`) 초기화 수행.
    *   **TypeScript / Tailwind CSS v4** 기반의 프리미엄 개발 표준 적용.
    *   **핵심 스택 설치**: `zustand`(상태), `@tanstack/react-query`(페칭), `lucide-react`(아이콘) 완비.
    *   **Shadcn/UI 인프라 구축**: Radix UI 기반 Nova 프리셋 초기화 및 기본 UI 컴포넌트(`button`) 생성 완료.
*   **핵심 비즈니스 데이터 마이그레이션 및 대형 데이터셋 구축**:
    *   `product`, `brands`, `company`, `ingredients` 테이블 데이터 정비.
    *   **`product_sensory_attribute` 테이블에 약 54만 건(544,458건)의 대규모 감각 지표 데이터 벌크 인서트 완료.**
    *   **제품군 트렌드 벡터(`trend_vector`) 일괄 업데이트**: 36,439개 제품에 대해 15차원 감각 지표 점수를 집계하여 벡터 데이터 반영 완료.
    *   **컬럼 명칭 표준화**: `product` 및 `ingredients` 테이블의 벡터 컬럼명을 `sensory_attribute_vector`로 통일하고 백엔드 모델/API/스크립트 전체 반영 완료.
    *   **원료군 감각 지표 및 벡터 초기화**: `category`(Group 10) 코드를 기반으로 123개 성분에 대해 15가지 감각 점수(1.0~5.0, 0.5 단위) 랜덤 생성 및 `sensory_attribute_vector` 반영 완료.
    *   AI 추천 및 검색의 정밀도를 극대화하기 위해 전 제품군에 대해 15가지 감각 속성 점수 매핑 완료.
    *   **프론트엔드 - 신규개발 및 의뢰목록(V-201) 구현**: 
        *   프리미엄 대시보드 스타일의 의뢰 현황 페이지 구현 (`/development/inquiries`).
        *   의뢰 상태별 대시보드 위젯(전체, 진행중, 완료 등) 및 필터링 기능 포함.
        *   글래스모피즘(Glassmorphism) 및 다크모드 대응 디자인 적용.
    *   **기업 전용 사용자 테이블(`company_user`) 신설 및 API 구현**:
        *   제조사/브랜드사 직원의 부서(`dept_code`), 직책(`position`), 전문분야(`specialty_area`) 등을 관리할 수 있는 전담 테이블 구축 및 DB 반영 완료.
        *   SQLAlchemy 모델(`CompanyUser`) 및 Pydantic 스키마 정의 완료.
        *   **백엔드 API 완비**: 회원가입(`signup`), 로그인(`login`), 내 정보 조회 및 수정(`me`) API 구현 및 라우터 등록 완료 (`/api/v1/account/company-users`).
    *   **임시 로그인 UI 개선**: 메인 페이지에 제조사/바이어/관리자별 진입로 확보.

---

### 📁 프로젝트 폴더 구조 가이드 (Directory Structure Guide)
*작업 시 모든 신규 파일은 용도에 따라 아래 지정된 폴더에 생성해야 합니다.*

*   **`backend/`**: FastAPI 애플리케이션 소스 코드 및 환경 설정.
    *   `app/api/`: 도메인별 API 라우터 (auth, workflow, business, ai_rd 등).
    *   `app/models/`: SQLAlchemy 데이터베이스 모델.
    *   `app/schemas/`: Pydantic 데이터 검증 스키마.
    *   `app/services/`: 비즈니스 로직 및 외부 연동(AI, Color 등) 서비스.
*   **`design/`**: 프로젝트 기획, 설계 및 표준 정의 문서.
    *   `function-summary.md`: 전체 기능 명세서.
    *   `db-schema.sql`: 최신 통합 데이터베이스 스키마 정의.
    *   `sql-convention.md`: SQL 및 데이터 설계 표준 가이드.
    *   `function_api_list.md`: API 현황 및 상세 명세.
    *   `tech_stack.md`: 기술 스택 및 개발 환경 정의.
*   **`sql/`**: DB 운영 및 마이그레이션 관련 SQL 스크립트.
    *   상태 코드 추가, 데이터 보정, 마이그레이션 전용 `.sql` 파일들.
    *   `backup/`: DB 백업 및 데이터 덤프 파일.
*   **`scripts/`**: 데이터 분석, 초기 데이터 삽입(Seed), AI 테스트용 외부 파이썬 스크립트.
*   **`data/`**: 제품 데이터셋, 원료 리스트 등 로직에 활용되는 원본 데이터 자산.
*   **Root (`./`)**: `work-history.md` (작업 이력), `.env` 등 핵심 설정 파일.

---

### ⚠️ 작업 가이드 및 교훈 (Lessons Learned)
*   **AI 작업 부하 및 환각(Hallucination) 관리**: DB 스키마 생성과 복잡한 백엔드 CRUD API 구현을 한 번의 명령으로 동시에 수행할 경우, AI 답변의 일관성이 무너지거나 비정상적인 텍스트가 출력되는 현상이 발생함.
*   **협업 프로세스 개선**: 향후 복잡한 기능 구현 시 **[1단계: DB 테이블 및 스키마 설계/생성] -> [2단계: 백엔드 모델/스키마/서비스 구현] -> [3단계: API 라우터 연동]** 순으로 단계를 명확히 나누어 진행함으로써 작업의 정확도를 보장하기로 함.

---

---

### 다음 단계 작업 계획 (Next Steps)
1.  **품질 관리 및 성적서 시스템 완성**: QC 결과 데이터를 기반으로 PDF 형태의 시험 성적서(CoA)를 자동 생성하는 API 및 템플릿 구현.
2.  **정산 및 가격 엔진 고도화**: 다중 통화 지원 및 수량별 자동 할인 로직을 정산 API에 통합.
3.  **AI 지능형 비즈니스 코파일럿 (6단계 고도화)**: 대시보드 및 내부 물류 데이터를 기반으로 제품 상태를 자연어로 답변하는 Gemini 에이전트 연동.
4.  **프론트엔드 대시보드 연동**: 구현된 API들을 실제 리액트/뷰 대시보드 화면에 매핑하여 시각화.

---

### 2026-04-11 작업 상세
*   **사용자 인증 및 보안 체계 고도화**:
    *   나머지 다중 역할(바이어, 제조사) 로그인 핸들러 완성 및 메인 페이지 연동.
    *   `passlib`와 최신 `bcrypt` 버전 간의 호환성 문제 해결을 위해 비밀번호 해싱 로직을 `bcrypt` 직접 호출 방식으로 전면 교체.
*   **신규 의뢰 작성 위자드(Inquiry Wizard) 구현**:
    *   3단계(기본 정보, 제품 스펙, 최종 확인)로 구성된 다단계 의뢰 작성 폼 개발.
    *   의뢰 생성 시 백엔드에서 자동으로 프로젝트(Project)와 상태 로그(Status Log)가 생성되도록 로직 연계 및 DB 모델 관계 정립.
*   **의뢰 상세 페이지(Detail View) 및 목록 연동**:
    *   `inquiries/[id]` 동적 라우팅을 통한 상세 정보 조회 페이지 구축.
    *   개발 목록에서 테이블 행 클릭 및 상세 메뉴 클릭 시 해당 페이지로 이동하도록 UX 개선.
*   **AI 스마트 컨설팅 상세보기 구현**:
    *   목록의 드롭다운 메뉴에서 즉시 리포트를 확인할 수 있는 **Sheet(Slide-over)** 방식의 전용 뷰어 구현.
    *   시장 적합도 점수, 추천 배합 베이스, 원가 최적화 팁 등 AI 분석 결과를 화려한 UI로 시각화.

### 2026-04-12 작업 상세
*   **로그인 안내 및 보안 강화 (Auth-Gate)**:
    *   **로그인 안내 페이지 구현**: 미인증 사용자가 보호된 경로에 접근할 때 표시되는 프리미엄 디자인의 `login-required` 페이지 구축 (`frontend/src/app/auth/login-required/page.tsx`).
    *   **전역 권한 가드(`AuthGuard`) 도입**: `localStorage`의 토큰 존재 여부를 확인하여 홈(`/`)과 안내 페이지를 제외한 모든 메뉴 진입 시 자동 리다이렉트 로직 구현.
    *   **로그아웃 기능 실체화**: 내비게이션 바의 로그아웃 버튼에 저장소 초기화 및 리다이렉트 로직 연동 완료.
*   **사용자 경험(UX) 및 데이터 보안 고도화**:
    *   **동적 내비게이션 바 프로필**: 백엔드에 `/me` 엔드포인트를 추가하고, 로그인한 사용자의 실제 이름과 이메일이 내비게이션 바에 실시간으로 표시되도록 연동.
    *   **역할 기반 데이터 격리 (Data Isolation)**: 바이어(Client) 로그인 시 다른 사람의 의뢰가 보이지 않도록 `buyer_id` 기준 필터링 강화. 제조사는 본인 업체 배정 건 중심으로 조회되도록 백엔드 쿼리 수정.
    *   **사용자 경험(UX) 개선**: 로그인 성공 시 표시되던 브라우저 기본 알림창(`alert("환영합니다")`)을 제거하여 더 매끄러운 진입 경험 제공.
    *   **역할별 UI 최적화**: 화장품 제조사(`company_user`)로 로그인 시, 개발 목록의 "신규 의뢰 작성" 버튼명을 "신규 의뢰 목록"으로 변경하여 역할에 맞는 용어 적용.
    *   **메뉴 용어 통일**: 사용자 피드백을 반영하여 '개발 목록' -> **'개발 제안'**, '프로젝트 진행' -> **'개발 진행'**으로 메뉴명을 일괄 변경하여 '개발 센터' 내의 용어 일관성 확보.
    *   **제안서 상세 작성 화면 구현**: 제조사가 수락한 프로젝트에 대해 실제 처방(성분, 제형 특징)과 상세 견적(단가, MOQ, 총액) 및 예상 일정을 입력할 수 있는 전용 폼(`/development/inquiries/[id]/proposal`)을 구축했습니다. 제안서 제출 시 프로젝트 상태가 '제안서 검토 중(`1300000012`)'으로 자동 전환됩니다.
    *   **개발 진행 대시보드 구현**: 제조사가 수수료를 수락한 프로젝트들을 집중 관리할 수 있는 전용 화면(`/development/projects`)을 구축했습니다. 리얼타임 진행률 바와 상태 태그를 통해 체계적인 공정 관리가 가능합니다.
    *   **상태 코드 표준화 (Group 13)**: `category` DB 테이블 내에 프로젝트 진행 상태 코드를 정의하고, 백엔드 로직에 반영했습니다. (1300000011: 제조사 수락/제안 대기, 1300000012: 제안 제출 등)
    *   **맥락 기반 액션 버튼 구현**: 프로젝트 상태에 따라 '상세보기' 또는 **'제안서 작성'**으로 버튼이 동적으로 변경되도록 설계하여 제조사의 다음 업무 단계를 직관적으로 제시합니다.
    *   **마켓플레이스 기능 강화**: 신청 시 DB 내 해당 제조사 배정 및 프로젝트 상태를 신규 표준 코드(`1300000011`)로 자동 업데이트하는 엔드 투 엔드 기능을 완성했습니다.

### 2026-04-12 (최종 업데이트)
- [Backend] 제조사 상세 제안 제출 API 구현 (`POST /projects/{id}/proposal`)
  - Quotation(견적서) 및 QuotationItem(상세 항목) 동시 생성 및 프로젝트 상태 전환 (`1300000012`: 제안 검토 중) 구현
  - 바이어용 제안 승인 API 구현 (`POST /projects/{id}/confirm`) -> 단계 전환 (`1300000005`: 견적 및 계약 확정)
- [Frontend] 제조사 제안서 작성 및 바이어 검토 UI 완성
  - 상세 제안서 입력 폼 (`/proposal`) 및 바이어 상세 페이지 내 [제조사 제안서] 확인 탭 연동
  - 프로젝트 리스트에서 ID 매칭 오류(Inquiry ID vs Project ID) 탐지 및 수정 완료
- [Stability] Pydantic 전방 참조(`from __future__ import annotations`) 도입으로 스키마 순환 참조 문제 해결

### 향후 작업 계획 (Next Steps)
- **공식 샘플 개발 및 QC 프로세스**:
  - 승인된 프로젝트에 대해 공식 샘플 제조 일정을 등록하고 QC(품질 검사) 성적서를 발행하는 기능 구현.
- **전자 계약 및 정산 연동**:
  - 시스템 내에서 간이 계약 확인서를 생성하거나 정산 요청을 생성하는 워크플로우 개발.
- **물류 및 배송 추적**:

---

### 2026-04-13 작업 상세 (정부장 & 코코 협업)
*   **백엔드 모듈 임포트 오류 수정**:
    *   `sample_routes.py`에서 존재하지 않는 `app.api.auth` 경로를 참조하여 발생하던 `ModuleNotFoundError`를 해결했습니다.
    *   인증 유틸리티 경로를 프로젝트 표준인 `app.api.account_company.auth_utils`로 수정하여 서버 안정성을 확보했습니다.
*   **공식 샘플 및 품평 관리 시스템(Sampling & Review) 구축**:
    *   **스마트 탭(Smart Tab) UI**: 프로젝트 상세 페이지에 '샘플링' 탭을 신설하고, 계약 완료(`1300000005`) 이후 단계에서만 동적으로 노출되도록 구현했습니다.
    *   **제조사 샘플 발송 기능**: 샘플 차수(V-ID), 송장 번호, 처방 특징 코멘트를 입력하여 바이어에게 발송 정보를 전달하는 인프라를 마련했습니다.
    *   **바이어 감각 품평(Sensory Review) 기능**: 5가지 핵심 지표(종합, 향, 제형, 흡수, 기능)에 대한 점수 기록 및 최종 결정(승인/보완/반려) 처리 기능을 완성했습니다.
    *   **자동 상태 동기화**: 바이어의 품평 결과에 따라 프로젝트 및 샘플의 상태 코드가 실시간으로 연동되도록 백엔드와 프론트엔드를 연결했습니다.
*   **타임라인 및 대시보드**: 각 차수별 샘플링 이력을 카드 형태로 시각화하고 상단 통계 위젯을 통해 진행 상황을 한눈에 파악할 수 있도록 했습니다.
*   **생산 진척도 및 원부자재 관리 시스템 구축**:
    *   **DB 설계 및 이식**: `project_production_progress` 테이블 신설 및 카테고리 코드(Group 20, 21, 22) 정비 완료.
    *   **백엔드 API 완비**: 생산 진척도 조회 및 제조사 상태 업데이트 API(`ProductionService`, `production_routes`) 구현.
    *   **프론트엔드 생산 탭 구현**: 상세 페이지 내 **[생산/물류]** 스마트 탭 신설. 원료/부자재 수급 현황 및 생산 일정을 시각화하여 바이어-제조사 간 투명한 공정 공유 실현.
*   **시스템 안정화 및 버그 수정**:
    *   상세 페이지의 비대했던 소스 코드(777라인)를 모듈화하여 233라인으로 리팩토링 완료.
    *   JSX 파싱 에러(태그 누락) 및 Lucide 아이콘(Truck) 임포트 누락 등 실시간 트러블슈팅 완료.

*   **품질 관리(QC) 지능형 시스템 구축**:
    *   **코드 데이터 표준화**: 품질 검사 항목 전용 코드 그룹(23: pH, 점도, 비중, 성상, 취, 미생물, 중금속)을 `category` 테이블에 신규 등록했습니다.
    *   **데이터 모델 최적화**: `test_parameter` 컬럼명을 사용자의 요청에 따라 `test_parameter_code`로 변경하고, 시스템 전체(DB, 모델, 스키마, 서비스, UI)에 일괄 적용했습니다.
    *   **백엔드 QC 엔진 완성**: 리포트 마스터 생성, 항목 자동 초기화, 결과 입력 및 합불 자동 판정 로직을 `QCService`에 구현 완료했습니다.
    *   **스마트 QC 탭 UI 구현**: 제조사 연구원이 실시간으로 검사 데이터를 입력하고, 바이어는 결과 리포트를 즉시 조회할 수 있는 전용 인터페이스를 완성했습니다.
    *   **트러블슈팅**: 생성 버튼 클릭 시 DB 커밋 누락으로 데이터가 반영되지 않던 결함을 수정하여 시스템 안정성을 확보했습니다.
    *   **UX 고도화**:
        *   **지능형 입력 시스템**: 규격(Spec) 유형에 따라 텍스트 박스와 [동일] 체크박스가 자동 전환되는 UX 구현.
        *   **일괄 저장 기능**: 개별 항목별 저장의 불편함을 개선하고 표 하단 [검사 결과 일괄 저장] 버튼 하나로 모든 데이터를 한 번에 처리.
        *   **기본 항목 자동 세팅**: 규격 미등록 시에도 필수 5종(pH/점도/성상/취/미생물) 항목을 자동 생성하도록 보강.
        *   **백엔드 최적화**: 일괄 업데이트 전용 API 라우트(`batch-results`)를 추가하여 네트워크 오버헤드 감소.
    *   **공정 검증**: 공정 중검사 -> 출하 검사로 이어지는 품질 관리 데이터 흐름 및 바이어 조회 연동 확인.

### CoA(시험성적서) 디지털 발행 시스템 구축 (완료)
- **프리미엄 CoA 레이아웃 구현**:
    - `CoAModal.tsx` 개발: A4 비율의 전문가용 그리드 레이아웃, 워터마크, 디지털 인감 섹션 포함.
    - 브라우저 인쇄(`window.print`) 기능을 통한 PDF 저장 및 출력 최적화.
- **백엔드 발행 엔진 고도화**:
    - **발행 번호 자동화**: `COA-YYYYMMDD-001` 형식의 고유 시리얼 번호 생성 로직 구현.
    - **데이터 스냅샷**: 발행 시점의 합격 데이터를 JSON 형태로 박제하여 위변조 방지 및 이력 추적성 확보.
- **컴포넌트 통합 및 연동**:
    - 제조사(발행 권한)와 바이어(열람 권한) 간의 역할 기반 버튼 UX 구현 및 런타임 트러블슈팅 완료.

---

### 향후 작업 계획 (Next Steps)
1.  **출하 승인(Outbound Approval) 워크플로우**: CoA 발행 완료 후 최종 물류 발송 승인 및 송출 내역 연동.
2.  **비즈니스 센터 및 정산 대시보드**: 누적 발주 내역 및 월별 정산 예상액 시각화.
3.  **AI 비즈니스 코파일럿 전용 챗봇**: 대시보드 데이터를 실시간으로 읽어 자연어로 답변하는 상담 창구.
4.  **대량 주문 대응 MOQ 가격 엔진**: 발주 수량에 따른 자동 단가 계산 시뮬레이터 고도화.
work-history.md

# Cosmetics-B2B 프로젝트 작업 이력 (Work History)

## [2026-04-13] 출하 승인 기능 완성 및 전사 API 라우팅 구조 대개편
- **출하 승인(Outbound Approval) 워크플로우 구현**:
    - 제조사의 출하 요청 및 바이어의 최종 승인/발송 지시 기능 완성.
    - `category` 테이블 연동으로 품질/정산 상태 코드 자동 관리 로직 구현.
- **라우팅 충돌 버그(422 Unprocessable Entity) 근본 해결**:
    - 동적 경로(`/{id}`)가 고정 경로를 가로채는 현상을 분석하여 해결.
- **전사 API 아키텍처 리팩토링 (Static-First Policy)**:
    - `Quotation`, `Settlement`, `QC`, `Production`, `Sample` 모듈의 모든 동적 루트 경로를 고정 경로(`/detail`, `/update` 등)로 개편.
    - 파라미터 전달 방식을 쿼리 스트링(`?id=...`)으로 통일하여 경로 충돌 가능성을 원천 차단.
- **프론트엔드 컴포넌트 동기화**:
    - `OutboundTab`, `QualityControlTab`, `SamplingTab`, `ProductionTab` 등 주요 탭의 API 호출부 전면 수정.

## 📅 작성일: 2026-03-24 (Update)

### 프로젝트 핵심 파트너
*   **사용자**: 정부장 (General Manager Jeong)
*   **AI 어시스턴트**: 코코 (Coco)

### 지금까지 완료된 작업

1.  **백엔드 기반 구조 구축**
    *   `backend/` 디렉토리 생성 및 초기 프로젝트 구조 설계.
    *   `backend/app/main.py`에 기본적인 FastAPI 서버 코드 작성.

2.  **64비트 개발 환경 구성 (Python 3.12)**
    *   기존 32비트 환경의 한계(`pgvector` 등 일부 바이너리 설치 불가)를 해결하기 위해 **Python 3.12 64-bit (Embeddable)** 버전을 `backend/python64`에 직접 설치.
    *   `python312._pth` 수정 및 `pip` 설치를 통해 독립적인 패키지 관리 환경 구축.
    *   기존 32비트 가상환경(`.venv`) 제거 후 64비트 환경으로 통합.

3.  **핵심 라이브러리 설치 완료**
    *   `fastapi`, `uvicorn[standard]` (웹 서버)
    *   `sqlalchemy`, `psycopg2-binary` (PostgreSQL 연동)
    *   `pydantic-settings`, `python-dotenv` (환경 변수 관리)
    *   `mcp`, `fastmcp` (AI MCP 연동 SDK)
    *   `backend/requirements.txt` 최신화.

4.  **데이터베이스 인프라 설계 및 협의**
    *   RAG 기능을 위한 **`pgvector`** 확장 지원 PostgreSQL 도입 결정.
    *   시스템 오염 방지 및 설치 편의성을 위해 **Docker** 기반 구축 합의.
    *   데이터 저장 경로를 `e:\Cosmetics-B2B\postgres_data`로 확정.

5. **Docker 및 데이터베이스 환경 구축 완료**
    *   WSL 2 및 Docker Desktop 설치 및 연동 완료 (Ubuntu-24.04).
    *   `docker-compose.yml` 및 `.env` 파일 작성 및 설정 완료.
    *   `pgvector/pgvector:pg16` 이미지 기반 DB 컨테이너 기동 (`cosmetics_db_container`).
    *   데이터베이스 내부 `vector` 확장(Extension) 활성화 완료.

6. **주요 화장품 B2B/ODM 벤치마킹 분석 완료**
    *   한국콜마, 코스맥스 플러스, UMMA, 코스메카코리아 4개 사이트 정밀 분석.
    *   각 플랫폼별 기능 목록(`function-list-01~04`) 및 테이블 설계안(`table-list-01~04`) 작성 완료.
    *   '제조 AI'와 '중개 플랫폼 AI'의 차이점 및 우리 프로젝트의 방향성(똑똑한 중개소) 정립 및 `project-concept-complement.txt` 기록 완료.

7. **기업 정보 관리(`company`) 및 카테고리(`Category`) 구축 완료**
    *   플랫폼 참여 기업 정보를 관리하기 위한 `company`(단수형) 테이블 추가.
    *   `inquiries`(의뢰) 및 `brands`(브랜드) 테이블과 `company_id`를 통한 외래 키(FK) 관계 연결 완료.
    *   계층형 그룹 코드 구조를 가진 `Category` 테이블 신규 생성 (Group Code 1~4 및 코드/설명 포함).
    *   사업자 등록번호 중복 체크 및 주력 분야, 인증 정보(JSONB) 등 상세 컬럼 반영.

---

### 진행 중인 작업 (Pending)

*   **스마트 관제탑 구조 완성 (Inquiry Detail)**: 상세 페이지를 7개 이상의 스마트 탭으로 분리하여 유지보수성을 확보하고, 샘플링 및 생산 관리를 통합 완료.

---

### 2026-03-23 작업 상세
*   **벡터 DB 기술 검토**: `pgvector` 외 전용 벡터 DB(Pinecone, Milvus 등) 및 클라우드(Neon, Supabase) 대안 검토.
*   **인프라 결정**: 윈도우 네이티브 설치의 복잡성을 고려하여 기존 Docker 기반 `pgvector` 환경을 그대로 유지하기로 최종 합의.
*   **스키마 통합 시도**: 4개 벤치마킹 사례(`table-list-01~04`)를 하나로 통합한 스키마 구조 설계 및 SQL 작성 (익일 상세 구체화 예정).

---

### 2026-03-24 작업 상세
*   **테이블 명칭 단수화 및 정비**: 모든 테이블 명칭을 사용자 요청에 따라 단수형(`company`, `Category`)으로 통일 및 `db-schema.sql` 반영.
*   **계층형 카테고리 구현 및 데이터 삽입**: 4단계 그룹 코드 체계를 갖춘 `Category` 테이블을 스키마에 추가하고, 사용자가 제공한 15가지 사용 속성(Sensory Attributes) 데이터를 성공적으로 삽입.
*   **카테고리 코드 체계 변경 및 정규화**: `group_code1`을 10으로, `group_code2`를 10번대(10, 11, 12, 13)로 일괄 변경. 미사용 코드 필드(`group_code3`, `group_code4`)의 `NULL`값을 `'00'`으로 업데이트하고 스키마에 `DEFAULT '00'`을 설정하여 가독성과 데이터 정합성 확보.
*   **감각적 속성(`sensory_attribute`) 테이블 구축**: 제품의 향, 질감 등을 관리하기 위한 전용 테이블을 생성하고 문서에 반영.
*   **글로벌 제품 데이터셋 임포트(1,472건)**: `Cosmetics-product_dataset.zip`을 분석하여 글로벌 브랜드와 제품 데이터를 DB에 이식.
    *   중복 방지 및 FK 정합성을 위해 10개의 가상 지배 기업(Global Beauty Group)을 자동 생성하여 연결.
    *   116개의 브랜드와 1,472개의 상세 제품(성분, 가격, 랭킹 포함) 정보 구축 완료.
*   **DB 마이그레이션 실행 및 문서 동기화**: `Category` 테이블에 `code_name` 영문 컬럼을 추가하고, 모든 변경 사항을 `db-schema.sql` 및 `table-summary.md` 등에 즉시 반영.
*   **테이블 명칭 표준화 최종 완료**: 사용자의 편의를 위해 대소문자를 구분하던 `"Category"` 테이블을 소문자 `category`로 변경하고, 관련 외래 키 및 스키마 정의를 모두 최신화.
*   **감각 벡터(`trend_vector`) 구현 및 AI 검색 검증**: 
    *   `product` 테이블에 15차원 `trend_vector` 컬럼을 추가하고, `sensory_attribute` 점수 데이터를 집계하여 제품별 감각 프로필 벡터를 생성(1,472건).
    *   `pgvector`의 코사인 유사도(`<=>`) 연산을 활용하여 "밀착력이 좋은 제품" 등 자연어 요구사항에 맞는 제품 추천 기능의 동작을 성공적으로 검증.
*   **AI 비즈니스 코파일럿(Copilot) 명세 수립**: 
    *   단순 제품 검색을 넘어 제품 개발, 생산, 물류, 정산 등 전체 비즈니스 프로세스의 상태를 AI 채팅으로 실시간 조회할 수 있도록 기능을 확장 설계.
*   **플랫폼 설계 문서(Blueprint) 구축 완료**: 
    *   통합 기능 명세서(`function-summary.md`) 및 주요 화면 목록(`view_list.md`) 작성을 통해 개발을 위한 모든 준비 단계 완료.

---

### 2026-04-07 작업 상세 (Windows to Mac Migration)
*   **프로젝트 환경 이관**: 윈도우(Windows) 기반 개발 환경에서 맥(MacOS, Apple Silicon) 환경으로 프로젝트 폴더 전체 이식 및 경로 최신화.
*   **Docker DB 컨테이너 기동**: `docker-compose up -d`를 통해 `cosmetics_db_container` (pg16 + pgvector) 정상 실행 확인.
*   **백업 데이터(`backup.sql`) 임포트 및 트러블슈팅**: 
    *   **문제 발생**: 윈도우에서 생성된 백업 파일이 `UTF-16LE` 인코딩 및 `BOM`을 포함하고 있어 `psql` 임포트 시 문자셋 에러(`invalid byte sequence`, `0xff`) 발생.
    *   **해결 과정**: `iconv`를 통한 `UTF-8` 변환 및 `tail` 명령어를 이용한 `BOM` 제거(`backup_final.sql` 생성) 시도.
    *   **최종 해결**: Homebrew를 통해 맥용 `postgresql` 클라이언트 툴을 설치하고, **DBeaver**의 `Restore database` 기능을 활용하여 인코딩 충돌 없이 데이터 복구 완료.
*   **데이터 무결성 및 인코딩 검증**: 임포트 완료 후 `category`, `product` 등 주요 테이블의 한글 데이터가 깨짐 없이 정상적으로 조회됨을 최종 확인.

---

### 2026-04-08 작업 상세
*   **Mac 전용 가상환경 구축**: `python3.12`를 사용하여 백엔드 가상환경(`.venv`) 생성 및 라이브러리 설치 완료.
*   **서버 구동 확인**: `uvicorn app.main:app --reload` 명령어를 통해 FastAPI 서버가 정상적으로 실행됨을 확인 (`/health` 엔드포인트 응답 확인).
*   **API 모듈 구조 설계 및 생성**: `function-summary.md`의 6개 핵심 기능을 기반으로 `app/api/` 하위에 도메인별 폴더(account_company, development_workflow, ai_rd 등) 및 초기 라우터 파일 생성 완료.
*   **보안 및 업체 관리 (1단계) 백엔드 구현**:
    *   JWT 기반 인증 및 **Role-Based Access Control(RBAC)** 구현 (Admin, Manufacturer, Client 등급 분리).
    *   업체 스펙 및 보유 브랜드를 한곳에서 모아보는 **디지털 쇼룸 통합 조회 API** 구현.
    *   **파트너 레이팅 (`partner_ratings`)**: 테이블 스키마 설계, 모델 적용, 별점/의견 조회 CRUD API 추가.
*   **ODM/OEM 개발 워크플로우 (2단계) 시스템 완성**:
    *   **원스톱 의뢰 (`inquiries`)**: `cosmax_pkg_item_id`를 일반 컬럼으로 연결하고 관련 모델/스키마 확정.
    *   **상세 문진표 매핑 (`inquiry_questions`)**: `category` 테이블과 의뢰서를 N:M으로 다대다 연결하는 매핑 구조 신규 도입 및 API CRUD 완비.
    *   **문진 기초 데이터 확보 (`category`)**: 타겟 효능, 컨셉 성분, 텍스처, 피부 타입(group_code1=12~15) 데이터 SQL 추가 및 Database 인서트 완료.
    *   **패키징 라이브러리 관리 (`cosmax_pkg_items`)**: 관리자용 자재 등록, 수정, 삭제(CRUD) API 추가.
    *   **적합성 테스트 (C/T) (`compatibility_tests`)**: 용기와 제형의 매칭 점검을 위한 신규 테이블 설계, Pydantic 검증 및 백엔드 CRUD API 구현.
    *   **글로벌 컴플라이언스 가이드 (`compliance_rules`)**: 미국, 중국 등 각국 배합 금지 성분 관리 테이블 신설 및 Admin 관리용 전체 CRUD API 구현 완료.
*   **AI 기반 R&D 혁신 (3단계) 인프라 및 API 구축**:
    *   **원료 마스터 DB (`ingredients`)**: CDPH 데이터를 파싱하여 122개의 핵심 화학 성분 및 CAS 번호 이식 완료.
    *   **감각 지표 고도화**: `product_sensory_attribute`로 테이블명 최적화 및 원료별 감각 지표(`ingredients_sensory_attribute`) 데이터 1,830건 생성.
    *   **벡터 검색 가동**: `ingredients_vector`(15차원)를 생성하여 `pgvector` 기반 코사인 유사도 검색 로직 구현.
    *   **제미나이(Gemini 2.5 Flash) 연동**: 사용자의 자연어 요청을 벡터로 변환하고 성분 추천 및 연구원 가이드 설명을 생성하는 `AIService` 구현.
    *   **추천 API 완성**: `POST /api/v1/ai-rd/recipe-recommend` 엔드포인트 구현 및 시뮬레이션 검증 완료.

---

### 2026-04-09 작업 상세
*   **프로젝트 구조 고도화 및 폴더 정리**:
    *   **설계/문서 (`design/`)**: `db-schema.sql`, 기획 Markdown, 컨셉 파일들을 모아 설계 자산화.
    *   **데이터 자산 (`data/`)**: 대용량 원본 데이터(ZIP, CSV) 및 대형 임포트용 SQL 파일 격리.
    *   **DB 관리 (`sql/`)**: 마이그레이션 scripts, 백업(`backup.sql`), 데이터 검증 SQL 파일들을 통합 관리.
    *   **운영 스크립트 (`scripts/`)**: DB 초기화, 데이터 임포트, AI 테스트 등 파이썬 유틸리티 스크립트들을 별도 분리.
    *   **백엔드 로직 (`backend/`)**: 순수 애플리케이션 소스 코드 및 가상환경 중심으로 정비.
*   **스크립트 경로 최적화**: 
    *   `scripts/` 폴더 내 모든 `.py` 파일(5종)의 내부 경로 로직을 수정하여 프로젝트 루트, 백엔드 모듈, 데이터 파일을 정확히 참조하도록 업데이트 완료.
*   **디지털 조색 및 색상 측정 API 구현**:
    *   **데이터 모델 (`models/color.py`)**: `ColorMaster`, `ColorMeasurementLog` 모델 정의 및 `Product`, `Project`와 관계 설정.
    *   **색차 계산 서비스 (`services/color_service.py`)**: CIELAB(CIE76) 공식을 활용한 **Delta E($\Delta E$) 실시간 계산** 및 합격 여부(Tolerance) 판정 로직 구현.
    *   **REST API (`api/ai_rd/color_routes.py`)**: 
        *   표준 색상 등록/조회(CRUD).
        *   실시간 색상 측정 및 오차 로그 기록 API.
        *   DB 저장 없이 즉시 색차를 계산하는 유틸리티 엔드포인트 추가.
    *   **라우터 등록**: `/api/v1/ai-rd/color` 경로로 전체 API 통합 완료.
*   **R&D 상세 데이터 라이브러리 테이블 구축**:
    *   **제형 상세 레시피 (`formula_recipes`)**: 자산별 원료 배합 비율 및 공정 단계(Phase) 관리 테이블 추가.
    *   **원료 효능 매핑 (`ingredient_efficacies`)**: 원료별 정밀 효능(미백, 주름 등) 및 근거 수준 관리 테이블 추가.
    *   **독점 자산 관리 (`exclusive_assets`)**: 업체별/지역별 자산 독점권 및 소유권 관리 테이블 추가.
*   **R&D 데이터 라이브러리 풀(Full) CRUD API 구현**:
    *   **데이터 모델 (`models/rd_library.py`, `models/ingredient.py`)**: `CosmaxRAndDAsset`, `Ingredient` 및 신규 3개 테이블의 SQLAlchemy 모델 구현.
    *   **Pydantic 스키마 (`schemas/rd_library.py`)**: 생성/조회/수정 전용 스키마 완비.
    *   **서비스 로직 (`services/rd_service.py`)**: 제형 레시피, 원료 효능, 독점 권한 관리를 위한 **생성, 조회, 수정, 삭제(CRUD)** 전체 기능 구현.
    *   **REST API (`api/ai_rd/rd_routes.py`)**: `/api/v1/ai-rd/library` 경로 하위에 GET, POST, PATCH, DELETE 엔드포인트 완비.
*   **스마트 문진 시스템 및 AI 추천 엔진 고도화**:
    *   **컨설팅 서비스 (`services/consulting_service.py`)**: 특정 `inquiry_id`의 문진 결과 점수를 분석하고, R&D 라이브러리와 매핑하여 최적의 추천 데이터를 추집하는 로직 구현.
    *   **AI 코파일럿 강화 (`services/ai_service.py`)**: 단순 성분 검색을 넘어, 문진 데이터와 R&D 자산을 종합 분석하여 **'제품 개발 전략 리포트'**를 자동 생성하는 프로모팅 로직 추가.
    *   **스마트 컨설팅 API (`api/ai_rd/routes.py`)**: `/api/v1/ai-rd/smart-consulting` 엔드포인트 신설. 고객 요구사항에 딱 맞는 베이스 제형, 핵심 성분, 마케팅 포인트를 한 번에 제공.
*   **AI 매칭 알고리즘 정교화 및 결과 저장 구현**:
    *   **가중치 기반 스코어링**: 문진 항목 중 '효능(Efficacy)' 카테고리에 2배의 가중치를 부여하도록 로직 고도화.
    *   **R&D 자산 랭킹 시스템**: 문진 키워드와 자산의 `trend_tags`를 매핑하여 유사도 점수를 계산하고 상위 후보를 추출하는 알고리즘 적용.
    *   **컨설팅 이력 저장 (`consulting_reports`)**: 생성된 AI 리포트 전문과 당시 사용된 매칭 점수를 DB에 영구 저장하여 히스토리 관리 가능하도록 구현.
    *   **데이터 모델 추가**: `ConsultingReport` 모델을 통해 AI 컨설팅 결과의 영속성 확보.
*   **비즈니스 거래 및 트래킹 (스마트 견적 및 생산 인프라)**:
    *   **스마트 견적 시스템 (`quotations`, `quotation_items`)**:
        *   발주 전 단계의 정밀 견적 이력 관리 시스템 구축 및 **Full CRUD API** 완비.
        *   **자동 단가 산출 엔진 (`PricingService`)**: MOQ(최소주문수량) 가격 티어링 정책을 실시간으로 반영하여 최적가 자동 계산.
        *   **할인 관리 고도화**: 항목별 할인율(`discount_rate`) 및 할인금액(`discount_amount`) 반영 로직 구현 및 전체 합계 자동 동기화.
    *   **생산 및 물류 트래킹 인프라 (`production_schedules`, `shipments`)**:
        *   **생산 공정 관리**: 배치 번호, 생산 라인 배정, 시작/종료 일정 트래킹 시스템 구축 및 **Full CRUD API** 완비.
        *   **물류 및 출고 관리**: 송장 번호 연동 및 배송 상태(`In-Transit`, `Delivered` 등) 추적 기반 마련 및 **Full CRUD API** 완비.
    *   **데이터 모델링 및 무결성**: 주문(`orders`)을 중심으로 한 견적-생산-물류 간의 1:N 관계 정의 및 데이터 스냅샷(견적가 불변성) 확보.
*   **실시간 대시보드 및 품질 관리(QC) 인프라 구축**:
    *   **카테고리 고도화**: `code_name`을 `code_name_kr`, `code_name_eng`로 분리하고 정규표현식으로 기존 데이터 정제 완료.
    *   **프로젝트 타임라인 (`project_status_logs`)**: 프로젝트 상태 변경 시 자동으로 이력을 남기는 로깅 시스템 및 타임라인 조회 API 구현.
    *   **품질 관리 시스템 (`quality_controls`)**: 생산 단계와 연동된 품질 검사 결과 기록 테이블 구축 및 CRUD API 완비.
    *   **표준 코드 정립**: 프로젝트 상태(10단계), 품질 상태(6단계)에 대한 계층형 코드 데이터(Group 13, 14) 삽입 완료.
    *   **가격 티어 CRUD**: 제조사가 직접 수량별 단가(Price Tiering)를 관리할 수 있는 API를 추가하여 '유연한 MOQ 대응' 기능 완성.

---

### 2026-04-10 작업 상세
*   **플랫폼 기능 범위 최적화 (Priority Adjustment)**:
    *   **글로벌 물류 및 재고 관리 (5단계) 전략 수정**: 외부 시스템(U-Quick, MES 등)과의 실시간 API 연동은 차기 단계로 연기하되, 플랫폼 내독립적으로 구현 가능한 **핵심 비즈니스 로직(Internal Logic)**은 우선순위를 높여 진행하기로 함.
*   **AI 파트너 페르소나 설정**:
    *   **애칭 확정**: 프로젝트의 성공적인 협업을 위해 AI 코딩 어시스턴트의 애칭을 **'코코(Coco)'** (Cosmetics Copilot의 약자)로 확정 및 기록.
*   **글로벌 정산 인프라 구축 및 표준 가이드 수립**:
    *   **DB 스키마 확장**: `exchange_rates`(환율 관리) 및 `settlements`(최종 정산 내역) 테이블 설계 및 생성 완료.
    *   **SQL 명명 규칙 가이드 수립**: `design/sql-convention.md` 파일을 생성하여 `_status_code` 형식 및 `VARCHAR(10)` 타입 사용 등 프로젝트 표준 SQL 규칙 정의.
    *   **기존 테이블 정규화**: `settlements` 테이블의 상태 컬럼을 규칙에 따라 `settlement_status_code`로 변경 완료.
    *   **공통 코드 정립**: 정산 상태 관리를 위한 공통 코드 그룹(15: 정산상태) 및 상세 상태값 7건을 `category` 테이블에 등록 완료. (프로젝트 표준에 맞춰 순번을 **01부터 시작**하도록 정규화 완료)
    *   **데이터 정합성 확보**: 주문(`orders`)과 연동된 세금, 수수료, 실 정산액(Net Amount) 계산 기반 마련.

## 2026-04-10 (현재)
*   **SQL 명명 및 코드 규칙 고도화 (By 코코)**
    *   **코드 체계 정립**: `category` 테이블의 `code` 생성 규칙을 `group_code1-4 || '순번'` 결합형으로 확정.
    *   **공통 코드 정규화**: 정산 상태 그룹(15)을 `01`(마스터)부터 시작하는 표준 체계로 재등록 및 가이드 반영.
*   **글로벌 가격 및 정산 엔진 구현 (Level 1 가시화)**
    *   **스마트 가격 시뮬레이션**: 수량별 MOQ 단가 자동 계산 및 환율 변환, 차상위 티어 절감액 제안 로직 구현 (`PricingService`).
    *   **정산 자동화 시스템**: 주문 완료 시 세금/수수료 공제 및 통화 변환을 거쳐 `settlements` 데이터를 생성하는 로직 구현 (`SettlementService`).
    *   **REST API 확장**: 시뮬레이션 및 글로벌 정산 관리를 위한 신규 엔드포인트 노출 완료.
*   **품질 관리(QC/QA) 프로세스 고도화 (Trust & Quality)**
    *   **QC 데이터 구조 혁신**: `product_qc_specs`(표준 규격) 및 `qc_items`(상세 시험 결과) 테이블 및 모델 구축.
    *   **자동 판정 엔진 구현**: 입력 수치와 표준 규격을 비교하여 합격/불합격을 자동으로 판정하는 `QCService` 로직 구현.
    *   **QC 전용 API 라우터 분리**: 규격 등록, 항목 자동 초기화, 결과 입력 및 판정 API 구축 (`qc_routes.py`).
*   **정보 서비스 및 인사이트 인프라 구축 (Intelligence & Insights)**
    *   **인사이트 리포트 시스템**: 시장 트렌드 분석 리포트 발행 및 조회 기능 구현 (`InsightReport`).
    *   **벡터 기반 트렌드 추적**: `trend_keywords`에 **`pgvector`**를 적용하여 의미 검색 지원. **다중 성분/상품 연계(N:N)**를 위해 배열 필드 적용.
    *   **시장 통계 시각화 데이터**: `JSONB` 유연한 데이터 구조를 가진 `market_statistics` 테이블 및 API 개발.
    *   **전문 명칭 도입**: 리포트 분류를 `insight_pillars_code`로, 상태 값을 `status_code`로 전문화하여 시스템 정체성 확립.
    *   **공통 코드 데이터 구축**: Group 17(인사이트 필라) 데이터 7종을 `category` 테이블에 성공적으로 등록.
*   **AI 지능형 비즈니스 코파일럿 인프라 구축 (AI Copilot)**
    *   **상담 세션 및 메시지 관리**: 지속 가능한 상담을 위한 `ai_chat_sessions`, `ai_chat_messages` 테이블 및 백엔드 CRUD 구현.
    *   **컨설팅 브리프 엔진**: 상담 결과를 전략 리포트로 도출하는 `ai_consulting_briefs` 인프라 구축.

---

### 2026-04-11 작업 상세
*   **기술 문서 정규화 및 정리**:
    *   `function_api_list.md` 및 `tech_stack.md`를 `design/` 폴더로 이동하여 문서 자류 체계화.
    *   중복 내용인 `development-environment.md`를 삭제하고, 핵심 인프라 및 아키텍처 정보를 `tech_stack.md`로 통합.
*   **개발 환경 최적화 (Node.js)**:
    *   Homebrew를 통해 **Node.js v20 (LTS)** 설치 및 환경 변수(`.zshrc`) 등록.
    *   최신 프레임워크(Next.js 16) 요구사항에 맞춘 런타임 환경 조성.
*   **프론트엔드 프로젝트 초기화 및 핵심 라이브러리 구축**:
    *   **Next.js 16 (App Router)** 기반의 프론트엔드 프로젝트(`frontend/`) 초기화 수행.
    *   **TypeScript / Tailwind CSS v4** 기반의 프리미엄 개발 표준 적용.
    *   **핵심 스택 설치**: `zustand`(상태), `@tanstack/react-query`(페칭), `lucide-react`(아이콘) 완비.
    *   **Shadcn/UI 인프라 구축**: Radix UI 기반 Nova 프리셋 초기화 및 기본 UI 컴포넌트(`button`) 생성 완료.
*   **핵심 비즈니스 데이터 마이그레이션 및 대형 데이터셋 구축**:
    *   `product`, `brands`, `company`, `ingredients` 테이블 데이터 정비.
    *   **`product_sensory_attribute` 테이블에 약 54만 건(544,458건)의 대규모 감각 지표 데이터 벌크 인서트 완료.**
    *   **제품군 트렌드 벡터(`trend_vector`) 일괄 업데이트**: 36,439개 제품에 대해 15차원 감각 지표 점수를 집계하여 벡터 데이터 반영 완료.
    *   **컬럼 명칭 표준화**: `product` 및 `ingredients` 테이블의 벡터 컬럼명을 `sensory_attribute_vector`로 통일하고 백엔드 모델/API/스크립트 전체 반영 완료.
    *   **원료군 감각 지표 및 벡터 초기화**: `category`(Group 10) 코드를 기반으로 123개 성분에 대해 15가지 감각 점수(1.0~5.0, 0.5 단위) 랜덤 생성 및 `sensory_attribute_vector` 반영 완료.
    *   AI 추천 및 검색의 정밀도를 극대화하기 위해 전 제품군에 대해 15가지 감각 속성 점수 매핑 완료.
    *   **프론트엔드 - 신규개발 및 의뢰목록(V-201) 구현**: 
        *   프리미엄 대시보드 스타일의 의뢰 현황 페이지 구현 (`/development/inquiries`).
        *   의뢰 상태별 대시보드 위젯(전체, 진행중, 완료 등) 및 필터링 기능 포함.
        *   글래스모피즘(Glassmorphism) 및 다크모드 대응 디자인 적용.
    *   **기업 전용 사용자 테이블(`company_user`) 신설 및 API 구현**:
        *   제조사/브랜드사 직원의 부서(`dept_code`), 직책(`position`), 전문분야(`specialty_area`) 등을 관리할 수 있는 전담 테이블 구축 및 DB 반영 완료.
        *   SQLAlchemy 모델(`CompanyUser`) 및 Pydantic 스키마 정의 완료.
        *   **백엔드 API 완비**: 회원가입(`signup`), 로그인(`login`), 내 정보 조회 및 수정(`me`) API 구현 및 라우터 등록 완료 (`/api/v1/account/company-users`).
    *   **임시 로그인 UI 개선**: 메인 페이지에 제조사/바이어/관리자별 진입로 확보.

---

### 📁 프로젝트 폴더 구조 가이드 (Directory Structure Guide)
*작업 시 모든 신규 파일은 용도에 따라 아래 지정된 폴더에 생성해야 합니다.*

*   **`backend/`**: FastAPI 애플리케이션 소스 코드 및 환경 설정.
    *   `app/api/`: 도메인별 API 라우터 (auth, workflow, business, ai_rd 등).
    *   `app/models/`: SQLAlchemy 데이터베이스 모델.
    *   `app/schemas/`: Pydantic 데이터 검증 스키마.
    *   `app/services/`: 비즈니스 로직 및 외부 연동(AI, Color 등) 서비스.
*   **`design/`**: 프로젝트 기획, 설계 및 표준 정의 문서.
    *   `function-summary.md`: 전체 기능 명세서.
    *   `db-schema.sql`: 최신 통합 데이터베이스 스키마 정의.
    *   `sql-convention.md`: SQL 및 데이터 설계 표준 가이드.
    *   `function_api_list.md`: API 현황 및 상세 명세.
    *   `tech_stack.md`: 기술 스택 및 개발 환경 정의.
*   **`sql/`**: DB 운영 및 마이그레이션 관련 SQL 스크립트.
    *   상태 코드 추가, 데이터 보정, 마이그레이션 전용 `.sql` 파일들.
    *   `backup/`: DB 백업 및 데이터 덤프 파일.
*   **`scripts/`**: 데이터 분석, 초기 데이터 삽입(Seed), AI 테스트용 외부 파이썬 스크립트.
*   **`data/`**: 제품 데이터셋, 원료 리스트 등 로직에 활용되는 원본 데이터 자산.
*   **Root (`./`)**: `work-history.md` (작업 이력), `.env` 등 핵심 설정 파일.

---

### ⚠️ 작업 가이드 및 교훈 (Lessons Learned)
*   **AI 작업 부하 및 환각(Hallucination) 관리**: DB 스키마 생성과 복잡한 백엔드 CRUD API 구현을 한 번의 명령으로 동시에 수행할 경우, AI 답변의 일관성이 무너지거나 비정상적인 텍스트가 출력되는 현상이 발생함.
*   **협업 프로세스 개선**: 향후 복잡한 기능 구현 시 **[1단계: DB 테이블 및 스키마 설계/생성] -> [2단계: 백엔드 모델/스키마/서비스 구현] -> [3단계: API 라우터 연동]** 순으로 단계를 명확히 나누어 진행함으로써 작업의 정확도를 보장하기로 함.

---

---

### 다음 단계 작업 계획 (Next Steps)
1.  **품질 관리 및 성적서 시스템 완성**: QC 결과 데이터를 기반으로 PDF 형태의 시험 성적서(CoA)를 자동 생성하는 API 및 템플릿 구현.
2.  **정산 및 가격 엔진 고도화**: 다중 통화 지원 및 수량별 자동 할인 로직을 정산 API에 통합.
3.  **AI 지능형 비즈니스 코파일럿 (6단계 고도화)**: 대시보드 및 내부 물류 데이터를 기반으로 제품 상태를 자연어로 답변하는 Gemini 에이전트 연동.
4.  **프론트엔드 대시보드 연동**: 구현된 API들을 실제 리액트/뷰 대시보드 화면에 매핑하여 시각화.

---

### 2026-04-11 작업 상세
*   **사용자 인증 및 보안 체계 고도화**:
    *   나머지 다중 역할(바이어, 제조사) 로그인 핸들러 완성 및 메인 페이지 연동.
    *   `passlib`와 최신 `bcrypt` 버전 간의 호환성 문제 해결을 위해 비밀번호 해싱 로직을 `bcrypt` 직접 호출 방식으로 전면 교체.
*   **신규 의뢰 작성 위자드(Inquiry Wizard) 구현**:
    *   3단계(기본 정보, 제품 스펙, 최종 확인)로 구성된 다단계 의뢰 작성 폼 개발.
    *   의뢰 생성 시 백엔드에서 자동으로 프로젝트(Project)와 상태 로그(Status Log)가 생성되도록 로직 연계 및 DB 모델 관계 정립.
*   **의뢰 상세 페이지(Detail View) 및 목록 연동**:
    *   `inquiries/[id]` 동적 라우팅을 통한 상세 정보 조회 페이지 구축.
    *   개발 목록에서 테이블 행 클릭 및 상세 메뉴 클릭 시 해당 페이지로 이동하도록 UX 개선.
*   **AI 스마트 컨설팅 상세보기 구현**:
    *   목록의 드롭다운 메뉴에서 즉시 리포트를 확인할 수 있는 **Sheet(Slide-over)** 방식의 전용 뷰어 구현.
    *   시장 적합도 점수, 추천 배합 베이스, 원가 최적화 팁 등 AI 분석 결과를 화려한 UI로 시각화.

### 2026-04-12 작업 상세
*   **로그인 안내 및 보안 강화 (Auth-Gate)**:
    *   **로그인 안내 페이지 구현**: 미인증 사용자가 보호된 경로에 접근할 때 표시되는 프리미엄 디자인의 `login-required` 페이지 구축 (`frontend/src/app/auth/login-required/page.tsx`).
    *   **전역 권한 가드(`AuthGuard`) 도입**: `localStorage`의 토큰 존재 여부를 확인하여 홈(`/`)과 안내 페이지를 제외한 모든 메뉴 진입 시 자동 리다이렉트 로직 구현.
    *   **로그아웃 기능 실체화**: 내비게이션 바의 로그아웃 버튼에 저장소 초기화 및 리다이렉트 로직 연동 완료.
*   **사용자 경험(UX) 및 데이터 보안 고도화**:
    *   **동적 내비게이션 바 프로필**: 백엔드에 `/me` 엔드포인트를 추가하고, 로그인한 사용자의 실제 이름과 이메일이 내비게이션 바에 실시간으로 표시되도록 연동.
    *   **역할 기반 데이터 격리 (Data Isolation)**: 바이어(Client) 로그인 시 다른 사람의 의뢰가 보이지 않도록 `buyer_id` 기준 필터링 강화. 제조사는 본인 업체 배정 건 중심으로 조회되도록 백엔드 쿼리 수정.
    *   **사용자 경험(UX) 개선**: 로그인 성공 시 표시되던 브라우저 기본 알림창(`alert("환영합니다")`)을 제거하여 더 매끄러운 진입 경험 제공.
    *   **역할별 UI 최적화**: 화장품 제조사(`company_user`)로 로그인 시, 개발 목록의 "신규 의뢰 작성" 버튼명을 "신규 의뢰 목록"으로 변경하여 역할에 맞는 용어 적용.
    *   **메뉴 용어 통일**: 사용자 피드백을 반영하여 '개발 목록' -> **'개발 제안'**, '프로젝트 진행' -> **'개발 진행'**으로 메뉴명을 일괄 변경하여 '개발 센터' 내의 용어 일관성 확보.
    *   **제안서 상세 작성 화면 구현**: 제조사가 수락한 프로젝트에 대해 실제 처방(성분, 제형 특징)과 상세 견적(단가, MOQ, 총액) 및 예상 일정을 입력할 수 있는 전용 폼(`/development/inquiries/[id]/proposal`)을 구축했습니다. 제안서 제출 시 프로젝트 상태가 '제안서 검토 중(`1300000012`)'으로 자동 전환됩니다.
    *   **개발 진행 대시보드 구현**: 제조사가 수수료를 수락한 프로젝트들을 집중 관리할 수 있는 전용 화면(`/development/projects`)을 구축했습니다. 리얼타임 진행률 바와 상태 태그를 통해 체계적인 공정 관리가 가능합니다.
    *   **상태 코드 표준화 (Group 13)**: `category` DB 테이블 내에 프로젝트 진행 상태 코드를 정의하고, 백엔드 로직에 반영했습니다. (1300000011: 제조사 수락/제안 대기, 1300000012: 제안 제출 등)
    *   **맥락 기반 액션 버튼 구현**: 프로젝트 상태에 따라 '상세보기' 또는 **'제안서 작성'**으로 버튼이 동적으로 변경되도록 설계하여 제조사의 다음 업무 단계를 직관적으로 제시합니다.
    *   **마켓플레이스 기능 강화**: 신청 시 DB 내 해당 제조사 배정 및 프로젝트 상태를 신규 표준 코드(`1300000011`)로 자동 업데이트하는 엔드 투 엔드 기능을 완성했습니다.

### 2026-04-12 (최종 업데이트)
- [Backend] 제조사 상세 제안 제출 API 구현 (`POST /projects/{id}/proposal`)
  - Quotation(견적서) 및 QuotationItem(상세 항목) 동시 생성 및 프로젝트 상태 전환 (`1300000012`: 제안 검토 중) 구현
  - 바이어용 제안 승인 API 구현 (`POST /projects/{id}/confirm`) -> 단계 전환 (`1300000005`: 견적 및 계약 확정)
- [Frontend] 제조사 제안서 작성 및 바이어 검토 UI 완성
  - 상세 제안서 입력 폼 (`/proposal`) 및 바이어 상세 페이지 내 [제조사 제안서] 확인 탭 연동
  - 프로젝트 리스트에서 ID 매칭 오류(Inquiry ID vs Project ID) 탐지 및 수정 완료
- [Stability] Pydantic 전방 참조(`from __future__ import annotations`) 도입으로 스키마 순환 참조 문제 해결

### 향후 작업 계획 (Next Steps)
- **공식 샘플 개발 및 QC 프로세스**:
  - 승인된 프로젝트에 대해 공식 샘플 제조 일정을 등록하고 QC(품질 검사) 성적서를 발행하는 기능 구현.
- **전자 계약 및 정산 연동**:
  - 시스템 내에서 간이 계약 확인서를 생성하거나 정산 요청을 생성하는 워크플로우 개발.
- **물류 및 배송 추적**:

---

### 2026-04-13 작업 상세 (정부장 & 코코 협업)
*   **백엔드 모듈 임포트 오류 수정**:
    *   `sample_routes.py`에서 존재하지 않는 `app.api.auth` 경로를 참조하여 발생하던 `ModuleNotFoundError`를 해결했습니다.
    *   인증 유틸리티 경로를 프로젝트 표준인 `app.api.account_company.auth_utils`로 수정하여 서버 안정성을 확보했습니다.
*   **공식 샘플 및 품평 관리 시스템(Sampling & Review) 구축**:
    *   **스마트 탭(Smart Tab) UI**: 프로젝트 상세 페이지에 '샘플링' 탭을 신설하고, 계약 완료(`1300000005`) 이후 단계에서만 동적으로 노출되도록 구현했습니다.
    *   **제조사 샘플 발송 기능**: 샘플 차수(V-ID), 송장 번호, 처방 특징 코멘트를 입력하여 바이어에게 발송 정보를 전달하는 인프라를 마련했습니다.
    *   **바이어 감각 품평(Sensory Review) 기능**: 5가지 핵심 지표(종합, 향, 제형, 흡수, 기능)에 대한 점수 기록 및 최종 결정(승인/보완/반려) 처리 기능을 완성했습니다.
    *   **자동 상태 동기화**: 바이어의 품평 결과에 따라 프로젝트 및 샘플의 상태 코드가 실시간으로 연동되도록 백엔드와 프론트엔드를 연결했습니다.
*   **타임라인 및 대시보드**: 각 차수별 샘플링 이력을 카드 형태로 시각화하고 상단 통계 위젯을 통해 진행 상황을 한눈에 파악할 수 있도록 했습니다.
*   **생산 진척도 및 원부자재 관리 시스템 구축**:
    *   **DB 설계 및 이식**: `project_production_progress` 테이블 신설 및 카테고리 코드(Group 20, 21, 22) 정비 완료.
    *   **백엔드 API 완비**: 생산 진척도 조회 및 제조사 상태 업데이트 API(`ProductionService`, `production_routes`) 구현.
    *   **프론트엔드 생산 탭 구현**: 상세 페이지 내 **[생산/물류]** 스마트 탭 신설. 원료/부자재 수급 현황 및 생산 일정을 시각화하여 바이어-제조사 간 투명한 공정 공유 실현.
*   **시스템 안정화 및 버그 수정**:
    *   상세 페이지의 비대했던 소스 코드(777라인)를 모듈화하여 233라인으로 리팩토링 완료.
    *   JSX 파싱 에러(태그 누락) 및 Lucide 아이콘(Truck) 임포트 누락 등 실시간 트러블슈팅 완료.

*   **품질 관리(QC) 지능형 시스템 구축**:
    *   **코드 데이터 표준화**: 품질 검사 항목 전용 코드 그룹(23: pH, 점도, 비중, 성상, 취, 미생물, 중금속)을 `category` 테이블에 신규 등록했습니다.
    *   **데이터 모델 최적화**: `test_parameter` 컬럼명을 사용자의 요청에 따라 `test_parameter_code`로 변경하고, 시스템 전체(DB, 모델, 스키마, 서비스, UI)에 일괄 적용했습니다.
    *   **백엔드 QC 엔진 완성**: 리포트 마스터 생성, 항목 자동 초기화, 결과 입력 및 합불 자동 판정 로직을 `QCService`에 구현 완료했습니다.
    *   **스마트 QC 탭 UI 구현**: 제조사 연구원이 실시간으로 검사 데이터를 입력하고, 바이어는 결과 리포트를 즉시 조회할 수 있는 전용 인터페이스를 완성했습니다.
    *   **트러블슈팅**: 생성 버튼 클릭 시 DB 커밋 누락으로 데이터가 반영되지 않던 결함을 수정하여 시스템 안정성을 확보했습니다.
    *   **UX 고도화**:
        *   **지능형 입력 시스템**: 규격(Spec) 유형에 따라 텍스트 박스와 [동일] 체크박스가 자동 전환되는 UX 구현.
        *   **일괄 저장 기능**: 개별 항목별 저장의 불편함을 개선하고 표 하단 [검사 결과 일괄 저장] 버튼 하나로 모든 데이터를 한 번에 처리.
        *   **기본 항목 자동 세팅**: 규격 미등록 시에도 필수 5종(pH/점도/성상/취/미생물) 항목을 자동 생성하도록 보강.
        *   **백엔드 최적화**: 일괄 업데이트 전용 API 라우트(`batch-results`)를 추가하여 네트워크 오버헤드 감소.
    *   **공정 검증**: 공정 중검사 -> 출하 검사로 이어지는 품질 관리 데이터 흐름 및 바이어 조회 연동 확인.

### CoA(시험성적서) 디지털 발행 시스템 구축 (완료)
- **프리미엄 CoA 레이아웃 구현**:
    - `CoAModal.tsx` 개발: A4 비율의 전문가용 그리드 레이아웃, 워터마크, 디지털 인감 섹션 포함.
    - 브라우저 인쇄(`window.print`) 기능을 통한 PDF 저장 및 출력 최적화.
- **백엔드 발행 엔진 고도화**:
    - **발행 번호 자동화**: `COA-YYYYMMDD-001` 형식의 고유 시리얼 번호 생성 로직 구현.
    - **데이터 스냅샷**: 발행 시점의 합격 데이터를 JSON 형태로 박제하여 위변조 방지 및 이력 추적성 확보.
- **컴포넌트 통합 및 연동**:
    - 제조사(발행 권한)와 바이어(열람 권한) 간의 역할 기반 버튼 UX 구현 및 런타임 트러블슈팅 완료.

---

### 향후 작업 계획 (Next Steps)
1.  **물류(Logistics) 연동 및 배송 추적**: `Shipment` 테이블 연동을 통한 실시간 배송 상태 알림 및 운송장 번호 연동.
2.  **생산 공정 관리(MES) 심화**: `ProductionSchedule` 데이터를 기반으로 한 공정별(충진, 포장, 검사) 진척률 시각화 보강.
3.  **AI 비즈니스 코파일럿 전용 챗봇**: 발주 및 정산 데이터를 실시간으로 학습하여 자연어로 비즈니스 인사이트를 제공하는 상담 창구.
4.  **글로벌 결제 연동(Payment Gateway)**: 실제 카드 결제 및 가상 계좌 결제 모듈 연동 (데모 고도화).
5.  **다국어 지원(i18n)**: 글로벌 확장을 위한 영문/중문 서비스 전환 인프라 구축.





# 🗓️ Work History: Cosmetics-B2B Platform

이 문서는 2026년 3월 말 프로젝트 시작부터 현재까지의 모든 개발 이력을 기록한 마스터 타임라인입니다.

---

## [2026-04-15] 견적-발주-정산 워크플로우 표준화 및 통합 시스템 구축
거래 체결의 핵심인 견적 상태값 표준화와 정식 발주(PO) 및 정산(Settlement) 자동화 모듈을 완성했습니다.

### 📦 1. 견적(Quotation) 워크플로우 표준화
*   **상태 코드 체계 정비**:
    *   `quotations` 테이블의 `status` 문자열 컬럼을 `quotation_status_code`로 리팩토링 및 DB 마이그레이션(`ALTER TABLE`) 완료.
    *   **그룹 코드 26번** 신규 정의: Draft(01), Requested(02), Sent(03), Confirmed(04), Expired(05), Canceled(06) 상태값 카테고리화.
*   **백엔드/프론트엔드 전면 동기화**:
    *   제조사 제안서 제출부터 바이어 견적 승인까지의 모든 필드명을 새로운 상태 코드 체계로 업데이트하여 데이터 정합성 확보.

### 📑 2. 정식 발주(Order) 관리 시스템 구축
*   **발주 자동화 엔진 개발**:
    *   바이어가 견적 승인 시 `Order` 및 `OrderItem`이 자동 생성되는 `OrderService` 구현.
    *   발주 상태 트래킹 연동: Pending(발주 대기), Processing(생산 중), Shipped(배송 중), Delivered(완료).
*   **프리미엄 발주 관리 UI (/business/orders)**:
    *   PO(Purchase Order) 번호 기반의 통합 대시보드 및 상세 내역(Sheet) 뷰어 개발.
    *   PDF 발주서 다운로드 및 정산 단계 유도 UX 강화.

### 💰 3. 글로벌 정산(Settlement) 인보이스 자동화
*   **인보이스 자동 발행**:
    *   발주와 동시에 `Settlement` 데이터(인보이스)가 연동되어 대금 청구가 즉시 이루어지는 로직 구현.
    *   순 공급가(Net), 부가세(Tax), 플랫폼 수수료(Fee) 자동 분할 계산 엔진 탑재.
*   **정산 대시보드 연동**: 실시간 환율(USD/KRW) 및 결제 대기 금액 시각화 보강.

### 🐞 4. 시스템 안정화 및 트러블슈팅
*   **인증(Auth) 버그 수정**: 서비스 문의(`inquiries`) 페이지에서 프로젝트 목록 호출 시 인증 헤더가 누락되어 발생하던 `401 Unauthorized` 에러 해결.
*   **DB 정합성 동기화**: 소스 코드와 물리 데이터베이스 간의 컬럼명 불일치 이슈를 추적하여 수동 마이그레이션(Column Rename)으로 정면 돌파.

---

## [2026-04-14] AI 디지털 플랫폼 고도화 및 비즈니스 매칭 시스템 완성
오늘 진행된 4대 핵심 모듈의 통합 및 엔드투엔드 안정화 내역입니다.

### 🤖 1. AI 스마트 컨설턴트 (AI Smart Consultant)
*   **정밀 매칭 알고리즘 고도화:**
    *   가중치 기반 스코어링(`Weighted Scoring`) 적용: 바이어의 문격 및 효능 항목 가중치 반영.
    *   `ConsultingService` 연동: 문진 정보를 바탕으로 한 최적 성분/R&D 자산 랭킹 로직 완성.
*   **AI 리포트 영구 저장 시스템:**
    *   `consulting_reports` 테이블 신규 생성 및 AI 생성 리포트 스냅샷 저장 기능 구현.

### 🎨 2. AI 디지털 컬러 랩 (Digital Color Lab)
*   **실시간 색차 분석 대시보드:**
    *   CIELAB 기반 실시간 측정 및 ΔE 자동 계산 엔진 구현.
    *   표준 색상 100종 마스터 DB 시딩(Seeding) 완료.
*   **안정화:** 라우팅 충돌 및 타입 에러(`toFixed`) 등 전면 해결.

### 🧪 3. AI 포뮬러 랩 (AI Formula Lab)
*   **지능형 제형 시뮬레이터:**
    *   15차원 감성 지표 모델링 및 레이더 차트 시각화 엔진 탑재.
    *   제미나이 AI 기반 벡터 검색 연동 및 **Virtual Formula Sheet** 자동 생성.

### 🤝 4. 매칭 및 거래 관리 (Matching & Transaction)
*   **견적 관리 센터(Quotation Center):**
    *   37,000여 건의 누락 제품 단가(Wholesale Price) 지능형 일괄 복구 및 시딩.
    *   바이어 연동 실시간 제품 DB 검색 및 선택 팝업 UI 구현.
*   **시스템 안착:** 422(Validation), 500(Auth) 에러 전면 해결 및 실제 견적 데이터 DB 저장 프로세스 성공.

---

## [2026-04-13] 출하 승인 기능 완성 및 전사 API 라우팅 구조 대개편
*   **출하 승인(Outbound Approval) 워크플로우**: 제조사 출하 요청 및 바이어 최종 승인/발송 지시 기능 완성.
*   **라우팅 아키텍처 리팩토링**: 동적 경로 충돌 해결을 위한 **'Static-First Policy'** 도입 및 전사 API 경로 개편.
*   **생산/물류 트래킹**: 원부자재 수급 현황 및 생산 일정을 바이어와 실시간 공유하는 전용 탭 구현.
*   **품질 관리(QC) 고도화**: pH, 점도 등 7종 필수 항목 자동 판정 엔진 및 **CoA(시험성적서) 디지털 발행** 시스템 구축.

---

## [2026-04-12] 인증 보안 가드 및 프로젝트 제안 시스템 구축
*   **보안 강화 (Auth-Gate)**: 미인증 사용자 리다이렉션(`login-required`) 및 전역 `AuthGuard` 도입.
*   **역할 기반 데이터 격리**: 바이어/제조사별 데이터 조회 필터링 강화 및 `/me` 엔드포인트를 통한 프로필 연동.
*   **제조사 상세 제안 시스템**: 수락된 프로젝트에 대한 상세 처방 및 견적 입력 폼 완성.
*   **상태 코드 표준화**: 13번 그룹(프로젝트 진행 상태) 코드 체계 정비 및 로직 반영.

---

## [2026-04-11] 프론트엔드 프로젝트 킥오프 및 대용량 데이터 전처리
*   **프론트엔드 초기화**: Next.js 16 + Tailwind CSS v4 + Shadcn/UI 기반 프리미엄 개발 환경 구축.
*   **대규모 데이터 인서트**: 전 제품(36,439건)에 대한 **54만 건의 감각 지표 데이터** 벌크 업로드 및 `trend_vector` 업데이트.
*   **기업 사용자(CompanyUser) 관리**: 제조사/브랜드사 전용 계정 테이블 신설 및 로그인/회원가입 API 완비.

---

## [2026-04-07 ~ 04-10] 인프라 이전(Win to Mac) 및 AI R&D 인프라 구축
*   **환경 이관**: 윈도우에서 Mac(Apple Silicon)으로 개발 환경 이식 및 Docker DB 컨테이너 최적화.
*   **AI R&D 혁신 (3단계)**: 
    *   원료 마스터 DB 및 15차원 벡터 검색 엔진 구현.
    *   제미나이 AI 연동 처방 추천(Recipe Recommendation) 서비스 구축.
*   **비즈니스 표준 수립**: SQL 컨벤션 규정 및 글로벌 정산(환율/수수료) 인프라 설계.

---

## [2026-03-22 ~ 03-24] 프로젝트 기획 및 기반 인프라 구축
*   **프로젝트 컨셉 확립 (3/22)**: B2B 화장품 중개 플랫폼 '똑똑한 중개소' 방향성 정립.
*   **DB 인프라 구축**: `pgvector` 지원 PostgreSQL 도입 및 Docker 환경 구성.
*   **도메인 분석**: 한국콜마, 코스맥스 등 벤치마킹을 통한 핵심 기능 및 테이블 설계.
*   **카테고리 표준화**: 4단계 계층형 `category` 테이블 구축 및 글로벌 제품 데이터셋(1,472건) 임포트.

---

### 🚀 다음 단계 계획 (Next Steps)
1.  **정산/물류 대시보드 리얼타임 연동**: 실제 환율 및 배송 트래킹 API 연동.
2.  **AI 비즈니스 코파일럿 전용 챗봇**: 자연어로 비즈니스 데이터를 조회하는 에이전트 개발.
3.  **전자 계약 시스템**: 시스템 내 간이 계약 확약서 및 법적 증빙 인프라 구축.

## [2026-04-16] 발주 관리 시스템 고도화 및 데이터 표준화

### 1. 발주 관리(Official PO) 기능 검증 및 버그 수정
*   **권한 기반 데이터 격리 강화**:
    *   기존 견적 목록 API의 필터링 누락으로 타인의 견적을 수락하던 현상 수정.
    *   `Order` 모델에 `company_id` 컬럼을 누락하여 제조사별 필터링이 불가능했던 문제 해결.
*   **데이터 정합성 수정**: 바이어가 수락한 견적의 소유주(`buyer_id`)와 수주 업체(`company_id`)가 발주서에 정확히 매핑되도록 서비스 로직 보강.

### 2. 제조사 전용 배송 처리 기능 구현
*   **배송 기입 인프라 구축**:
    *   `PATCH /api/v1/business/orders/{id}/status` 엔드포인트 구현 (상태 및 배송 정보 업데이트).
    *   보안 적용: `Manufacturer` 또는 `Admin` 역할만 상태를 변경할 수 있도록 권한 검증 추가.
*   **UI/UX 개선**:
    *   `OrdersPage` 상세 시트(Sheet)에 제조사 전용 '배송 처리 폼' 추가.
    *   운송장 번호 및 배송 방법 입력 시 즉시 `1600000003` (배송 중) 상태로 전환되도록 연동.

### 3. 데이터베이스 표준화 및 공통 코드 연동
*   **SQL 컨벤션 준수 (`sql-convention.md`)**:
    *   `orders.order_status` 컬럼명을 `orders.order_status_code`로 변경하는 DB 마이그레이션 단행.
    *   백엔드(Model, Schema, Service, Route) 및 프론트엔드 코드 일괄 필드명 업데이트.
*   **공통 코드 그룹 16 (발주 상태) 신규 등록**:
    *   `category` 테이블에 표준 코드 등록: `1600000001` (Pending) ~ `1600000005` (Canceled).
    *   기존 문자열 기반 상태 데이터를 숫자 코드값으로 전수 마이그레이션.

---

## 향후 추진 계획
1.  **정산(Settlement) 시스템 연동**: 배송 완료(`1600000004`) 시 자동으로 정산 전표가 확정되는 로직 구현.
2.  **AI 비즈니스 코파일럿 전용 챗봇**: 자연어로 비즈니스 데이터를 조회하는 에이전트 개발.
3.  **전자 계약 시스템**: 시스템 내 간이 계약 확약서 및 법적 증빙 인프라 구축.

---
**Status:** ✅ 발주 관리 워크플로우(수주-배송) 및 데이터 표준화 작업 완료 (2026-04-16)
