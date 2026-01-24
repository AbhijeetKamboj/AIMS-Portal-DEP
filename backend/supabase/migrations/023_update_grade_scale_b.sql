-- Add 'B' to grade_scale if not exists
INSERT INTO grade_scale (grade, grade_point) VALUES ('B', 8.00) ON CONFLICT (grade) DO NOTHING;

-- Update any existing grades attempting to use B+ to B (if any legacy data exists)
UPDATE grades SET grade = 'B' WHERE grade = 'B+';

-- Remove 'B+' from grade_scale
DELETE FROM grade_scale WHERE grade = 'B+';
