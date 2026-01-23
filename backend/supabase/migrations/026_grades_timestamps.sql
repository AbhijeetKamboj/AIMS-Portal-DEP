-- Add submitted_at and approved_at columns to grades table
ALTER TABLE grades
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
