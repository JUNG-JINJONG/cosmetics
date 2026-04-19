-- 카테고리 테이블의 신규 상태 코드 그룹(20, 21, 22)에 대해 하위 그룹 코드를 '00'으로 통일
UPDATE category 
SET group_code2 = '00', 
    group_code3 = '00', 
    group_code4 = '00',
    updated_at = CURRENT_TIMESTAMP
WHERE group_code1 IN ('20', '21', '22');

-- 데이터 확인을 위한 SELECT (콘솔 출력용)
SELECT group_code1, group_code2, group_code3, group_code4, code, code_name_kr 
FROM category 
WHERE group_code1 IN ('20', '21', '22');
