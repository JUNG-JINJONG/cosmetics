-- Increase code column length and update values with concatenated group codes
ALTER TABLE "Category" ALTER COLUMN code TYPE VARCHAR(10);

UPDATE "Category"
SET code = group_code1 || group_code2 || group_code3 || group_code4 || code,
    updated_at = CURRENT_TIMESTAMP
WHERE group_code1 IS NOT NULL 
  AND group_code2 IS NOT NULL 
  AND group_code3 IS NOT NULL 
  AND group_code4 IS NOT NULL 
  AND code IS NOT NULL;
