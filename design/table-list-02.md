# 코스맥스 플러스 데이터 테이블 목록 (Table List - 02)

코스맥스 플러스의 '원스톱 개발 서비스'와 '패키징 라이브러리' 기능을 연계한 데이터 구조입니다.

## 1. ODM/OBM 업무의뢰 (Inquiry & Requests)
*   **cosmax_inquiries**: ID, user_id, brand_name, registration_num, websit_url, item_type, target_price, scent_pref, container_type, capacity, quantity, export_countries (제형 단가, 향, 용량, 수량 등 상세 문진 데이터)

## 2. 패키징 및 부자재 (Packaging Assets)
*   **cosmax_pkg_items**: ID, type (Tube, Pump, Cap, etc.), formulation_compatibility (제형 적합성 태그), material, capacity_options, design_type_mold (금형 정률/독점 여부), status (Available, Sold Out)

## 3. 프로젝트 관리 (Project Lifecycle)
*   **cosmax_projects**: ID, inquiry_id, status_code (Pending, Quoting, Contracted, Ordering, Producing, Releasing), current_phase_percent, start_at, expected_completion_at

## 4. R&D 자산 및 지식 기반 (R&D Assets)
*   **cosmax_r_and_d_assets**: ID, asset_type (Ingredient, Formula, Patent), name, patent_number, usage_count (인기 지수), trend_tags (유사도 검색용)
    *   *Note: `trend_tags` 및 `name` 필드는 pgvector를 활용하여 유사 제형 검색 시스템 구현 시 활용.*
