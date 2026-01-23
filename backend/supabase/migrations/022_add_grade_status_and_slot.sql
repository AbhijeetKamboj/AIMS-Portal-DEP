-- Add status column to grades table
ALTER TABLE grades 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add slot column to course_offerings table
ALTER TABLE course_offerings 
ADD COLUMN IF NOT EXISTS slot text;
