-- Create sensory_attribute table
CREATE TABLE IF NOT EXISTS sensory_attribute (
    sensory_attribute_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    sensory_attribute_code VARCHAR(10),
    point INTEGER CHECK (point >= 1 AND point <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Column Comments
COMMENT ON TABLE sensory_attribute IS '제품 감각적 속성 정보';
COMMENT ON COLUMN sensory_attribute.sensory_attribute_id IS '감각적 속성 일련번호';
COMMENT ON COLUMN sensory_attribute.product_id IS '제품 ID';
COMMENT ON COLUMN sensory_attribute.sensory_attribute_code IS '감각적 속성 코드 (Category의 group1=10 관련)';
COMMENT ON COLUMN sensory_attribute.point IS '점수 (1~5점)';
