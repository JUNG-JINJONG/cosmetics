-- 1. Add trend_vector column to product table
ALTER TABLE product ADD COLUMN IF NOT EXISTS trend_vector vector(15);

-- 2. Populate trend_vector with aggregated sensory points
-- Dimensionality: 15 (Category group1=10)
UPDATE product p
SET trend_vector = (
    SELECT ('[' || string_agg(point::text, ',' ORDER BY code) || ']')::vector
    FROM (
        SELECT c.code, COALESCE(sa.point, 0.0) as point
        FROM (SELECT code FROM category WHERE group_code1 = '10') c
        LEFT JOIN sensory_attribute sa ON sa.product_id = p.product_id AND sa.sensory_attribute_code = c.code
    ) t
);

-- 3. Add comment for the new column
COMMENT ON COLUMN product.trend_vector IS '제형/감각 데이터 기반 15차원 벡터 프로필';
