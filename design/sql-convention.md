# SQL Naming & Design Convention (Cosmetics-B2B)

이 문서는 프로젝트의 데이터베이스 정합성과 유지보수 편의를 위한 SQL 작성 규칙을 정의합니다. 모든 신규 테이블 생성 및 수정 시 이 가이드를 최우선으로 준수합니다.

## 1. 테이블 명명 규칙 (Table Naming)
*   **단수형 사용**: 테이블 이름은 반드시 단수 영어 명사를 사용합니다. (예: `user`, `company`, `product`)
*   **스네이크 케이스**: 모든 명칭은 소문자와 언더바(`_`)를 조합한 스네이크 케이스를 사용합니다.

## 2. 컬럼 명명 규칙 (Column Naming)
*   **기본 키(PK)**: `[테이블명]_id` 형식을 사용하며 `SERIAL` 또는 `BIGSERIAL` 타입을 권장합니다.
*   **상태 값(Status Code)**:
    *   모든 상태 관리 컬럼은 `[도메인/필드명]_status_code` 형식을 사용합니다.
    *   데이터 타입은 `VARCHAR(10)` 또는 `VARCHAR(20)`으로 제한하여 일관성을 유지합니다.
    *   예: `order_status_code`, `settlement_status_code`, `qc_status_code`
    *   **공통 코드 등록**: 새로운 성격의 상태값 필드를 생성할 경우, 반드시 `category` 테이블에 그룹 코드를 등록해야 합니다. (기존 품질 상태 `group_code1='14'` 사례 참고)
    *   **INSERT 규칙**: 
        1. **상세 코드 등록**: `group_code1`은 그룹 번호, 나머지는 '00' 고정이며 `code`는 그룹 코드 결합 후 '01'부터 순차적으로 증가시킵니다.
    ```sql
    -- 예시: 새로운 상태 그룹(15: 정산 상태) 등록 표준 가이드
    
    -- 상세 항목 등록 (01번부터 순차 번호 결합 적용)
    INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
    VALUES (
        '15', '00', '00', '00', 
        group_code1 || group_code2 || group_code3 || group_code4 || '01', 
        '정산 상태 코드 그룹', '정산대기', 'PENDING'
    );

    INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
    VALUES (
        '15', '00', '00', '00', 
        group_code1 || group_code2 || group_code3 || group_code4 || '02', 
        '정산 상태 코드 그룹', '정산완료', 'COMPLETED'
    );
    ```
*   **날짜/시간(Timeline)**:
    *   생성일: `created_at`
    *   수정일: `updated_at`
    *   타입: `TIMESTAMP WITH TIME ZONE` (TIMESTAMPTZ) 사용을 원칙으로 합니다.
*   **논리형(Boolean)**: `is_` 접두사를 사용합니다. (예: `is_verified`, `is_active`)

## 3. 데이터 타입 가이드
*   **금액(Price/Amount)**: `DECIMAL(15, 2)` 이상을 사용하여 소수점 정확도를 확보합니다.
*   **긴 텍스트**: 고정 길이가 아닌 경우 `TEXT` 또는 `VARCHAR(N)`을 사용합니다.
*   **AI 벡터**: `pgvector` 확장의 `vector(N)` 타입을 사용합니다.

## 4. 제약 조건 및 주석
*   **외래 키(FK)**: 관계가 명확한 경우 반드시 `REFERENCES` 제약을 설정합니다.
*   **주석(Comment)**: 모든 테이블과 주요 컬럼에는 `COMMENT ON` 명령어를 사용하여 **한글로 번역된 컬럼명**과 함께 설명을 상세히 추가합니다.
    *   형식: `COMMENT ON COLUMN [테이블명].[컬럼명] IS '[한글컬럼명] (필요 시 부연 설명)';`
    *   예: `COMMENT ON COLUMN orders.total_amount IS '총 주문 금액';`
