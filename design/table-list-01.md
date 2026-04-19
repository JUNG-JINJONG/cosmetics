# B2B 플랫폼 테이블 목록 (Table List)

본 목록은 한국콜마 분석 결과를 바탕으로 도출된 초기 데이터베이스 스키마 레이아웃입니다. (PostgreSQL / pgvector 환경 기반)

## 1. 회원 및 업체 구성
*   **users**: ID, email, password_hash, role (Admin, Manufacturer, Client), name, phone
*   **company**: ID, company_name, business_number, ceo_name, address, factory_address, contact_phone, contact_email, company_type (Manufacturer, Brand, Material), specialty, certifications, is_verified, created_at, updated_at

## 2. 제품 및 카테고리 정의
*   **Category**: ID, group_code1~4, group_code1~4_desc, code, code_desc, code_name
*   **products**: ID (Final Product), name, manufacturer_id, formula_id, category_id, description
*   **sensory_attribute**: ID, product_id (FK), attribute_code, attribute_name, point, desc

## 3. ODM/OEM 업무 의뢰 (Core Process)
*   **formula_requests**: ID (제형 의뢰), client_id, title, category_id, efficacy_goal, concept_desc, target_price_range, status (Pending, Reviewing, Lab_Test, Completed)
*   **package_requests**: ID (용기/패키징 의뢰), client_id, formula_request_id, package_type, material_req, status
*   **compatibility_tests**: ID (적합성 테스트), formula_request_id, package_request_id, test_result, status (Testing, Pass, Fail)

## 4. 거래 및 대외 정보
*   **estimate_requests**: ID (견적), client_id, project_id (formula/package 연동), work_specs, total_price, status
*   **orders**: ID (발주), client_id, product_id, quantity, shipping_address, order_date, delivery_date, status
*   **trend_reports**: ID (트렌드 리포트), title, content, image_url, category, created_at
    *   *Note: `content` 필드는 pgvector를 사용하여 검색 기능을 강화할 수 있음.*
*   **project_status_history**: ID (진행 이력), project_id, status_code, updated_at, comment (상태 변경 로그)

## 5. 지식 기반 및 매칭 (RAG 특화)
*   **ingredients**: ID, name, inci_name, efficacy, safety_grade, description_vector (Vector 검색용)
*   **base_formulas**: ID, name, manufacturer_id, main_effects, formulation_type, recipe_vector (제형 간 유사도 검색용)
