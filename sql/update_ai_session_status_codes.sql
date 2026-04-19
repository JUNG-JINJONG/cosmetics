-- 기존 ai_chat_sessions 테이블의 문자열 상태값을 공통 코드로 마이그레이션
UPDATE ai_chat_sessions 
SET status_code = '1800000001' 
WHERE status_code = 'Active';

-- 혹시나 다른 상태값이 있다면 (필요 시 추가)
-- UPDATE ai_chat_sessions SET status_code = '1800000002' WHERE status_code = 'Closed';
