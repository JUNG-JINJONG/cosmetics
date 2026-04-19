# 코스메카코리아 데이터 테이블 목록 (Table List - 04)

코스메카코리아의 OGM 프로세스와 스마트 팩토리 인프라에 맞춘 데이터 모델입니다.

## 1. 글로벌 토털 관리 (OGM)
*   **cosmecca_ogm_projects**: ID, client_id, project_title, target_market_code (US, CN, JP, EU, etc.), ogm_phase (Planning, R&D, Reg_Approval, Prod, QA, Release)

## 2. AI 기반 처방 및 성분 (AI R&D)
*   **cosmecca_formulas**: ID, formula_name, functional_type (UV, Anti-aging, Brightening), is_ai_optimized, compliance_tags (FDA-compliant, VEGAN, etc.), formula_vector (AI 유사도 검색용)
*   **cosmecca_compliance_log**: ID, project_id, country_code, regulation_passed (True/False), cert_document_url, last_reviewed_date

## 3. 스마트 팩토리 및 제조 (Smart Factory)
*   **cosmecca_factory_status**: ID, lot_number, line_id, mes_status (In_Work, QC_Pending, QC_Pass, QC_Fail), current_quantity, expected_completion (실시간 제조 현황 로그)
*   **cosmecca_qc_records**: ID, project_id, lot_number, test_item, test_result, inspector_name, certificate_url (시험 성적서 관리)
