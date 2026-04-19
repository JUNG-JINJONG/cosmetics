-- Alter point column and randomize values
ALTER TABLE sensory_attribute DROP CONSTRAINT sensory_attribute_point_check;
ALTER TABLE sensory_attribute ALTER COLUMN point TYPE NUMERIC(2, 1);
ALTER TABLE sensory_attribute ADD CONSTRAINT sensory_attribute_point_check CHECK (point >= 1.0 AND point <= 5.0);

UPDATE sensory_attribute 
SET point = 1.0 + floor(random() * 9) * 0.5,
    updated_at = CURRENT_TIMESTAMP;
