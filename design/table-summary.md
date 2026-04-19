# B2B 플랫폼 통합 데이터 스키마 (Table Summary)

이 문서는 한국콜마, 코스맥스, 코스메카코리아 및 UMMA의 분석 결과를 통합한 B2B 화장품 개발 및 유통 플랫폼의 핵심 데이터베이스 테이블 요약입니다. (PostgreSQL / pgvector 기반)

## 1. 공통 인프라 (Core Infrastructure)
*   **users**: 사용자 계정 정보 (ID, 이메일, 비밀번호 해시, 권한(ADMIN/MFG/CLIENT), 이름, 연락처)
*   **company**: 업체 정보 (ID, 업체명, 사업자번호, 대표자성함, 본사주소, 공장주소, 연락처, 이메일, 유형(제조사/브랜드사/원료사), 주력분야, 보유인증, 검증여부)
*   **Category**: 계층형 카테고리 정보 (ID, 그룹코드1~4 및 설명, 코드, 코드설명, 코드명(영문))

## 2. 개발 및 프로젝트 관리 (R&D & Project Management)
*   **formula_requests (inquiries)**: 제형 개발 의뢰서 (ID, 고객ID, 기업ID, 제목, 카테고리, 효능 목표, 컨셉, 타겟 단가, 향, 용량, 수출 국가, 상태)
*   **package_requests**: 용기 및 패키징 의뢰 아이템 (ID, 고객ID, 제형의뢰ID, 유형, 재질, 적합성 태그, 금형 정보, 상태)
*   **compatibility_tests**: 제형-용기 적합성 테스트 결과 (ID, 제형의뢰ID, 용기의뢰ID, 테스트 결과, 상태)
*   **projects**: 전체 프로젝트 통합 관리 (ID, 의뢰ID, 고객ID, 제목, 타겟 시장, 진행 단계, 현재 완성도, 시작일, 완료 예정일)
*   **project_status_history**: 프로젝트 진행 이력 로그 (ID, 프로젝트ID, 상태코드, 업데이트 일시, 코멘트)

## 3. R&D 자산 및 지식 기반 (R&D Assets & AI)
*   **ingredients**: 원료 정보 및 벡터 (ID, 성분명, INCI명, 효능, 안전 등급, 성분 벡터)
*   **base_formulas**: 베이스 제형 및 특허 정보 (ID, 제형명, 제조사ID, 주요 효능, 제형 타입, 특허 번호, AI 최적화 여부, 컴플라이언스 태그, 제형 벡터)
*   **compliance_logs**: 국가별 규제 준수 이력 (ID, 프로젝트ID, 국가코드, 규제 통과 여부, 인증서 URL, 검토일)

## 4. 유통 및 이커머스 (Wholesale & E-commerce)
*   **brands**: 브랜드 정보 (ID, 기업ID, 브랜드명, 로고, 설명, 파트너십 유형, 공식 인증 여부)
*   **products**: 최종 판매 제품 (ID, 브랜드ID, 카테고리ID, SKU, 제품명, 설명, 소비자 가격, 도매 기준가, MOQ, 재고량, 상태)
*   **sensory_attribute**: 제품 감각적 속성 정보 (ID, 제품ID, 속성코드, 속성명, 점수, 설명)
*   **price_tiers**: 수량별 계층적 도매 단가 정책 (ID, 제품ID, 수량 구간, 구간별 단가)
*   **outlet_deals**: 특가 및 재고 소진 딜 (ID, 제품ID, 할인율, 시작/종료일, 상태)

## 5. 주문 및 물류 (Orders & Logistics)
*   **estimate_requests**: 견적 요청 내역 (ID, 고객ID, 프로젝트ID, 상세 사양, 합계 금액, 상태)
*   **orders**: 발주 및 주문 정보 (ID, 구매자ID, 주문 상태, 총액, 통화, 배송 방식, 운송장 번호)
*   **order_items**: 주문 상세 항목 (ID, 주문ID, 제품ID, 수량, 주문 시 단가, 소계)

## 6. 제조 및 품질 관리 (Smart Factory & QC)
*   **factory_status**: 실시간 제조 라인 현황 (ID, 로트 번호, 라인 ID, MES 상태, 현재 수량, 완료 예정 시간)
*   **qc_records**: 품질 검사 및 성적서 관리 (ID, 프로젝트ID, 로트 번호, 검사 항목, 검사 결과, 검사자 명, 성적서 URL)
