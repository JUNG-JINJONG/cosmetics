-- Category 테이블에 code_name_kr 컬럼 추가 및 데이터 업데이트
-- code_desc 컬럼의 '한글명 (EnglishName)' 형식에서 EnglishName을 추출하여 code_name_kr에 저장

-- 1. 컬럼 추가 (이미 db-schema.sql에 반영했으나, 기존 DB 반영을 위해 작성)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Category' AND column_name='code_name_kr') THEN
        ALTER TABLE "Category" ADD COLUMN code_name_kr VARCHAR(100);
    END IF;
END $$;

-- 2. 데이터 업데이트
-- 정규표현식을 사용하여 괄호 안의 영문명 추출
UPDATE "Category"
SET code_name_kr = substring(code_desc from '\((.*)\)')
WHERE code_desc LIKE '%(%)%'
  AND (code_name_kr IS NULL OR code_name_kr = '');

-- 3. 확인 (코멘트 추가)
COMMENT ON COLUMN "Category".code_name_kr IS '코드명 (국문)';
