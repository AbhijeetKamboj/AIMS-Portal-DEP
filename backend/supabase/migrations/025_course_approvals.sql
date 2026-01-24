-- Add status column to courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Ensure faculty table has department if not
-- (It was in init_schema, so should be fine)
