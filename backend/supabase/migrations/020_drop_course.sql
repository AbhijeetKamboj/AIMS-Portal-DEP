-- Add dropped_at column for tracking when course was dropped
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS dropped_at TIMESTAMP;

-- Add status 'withdrawn' to track dropped courses
-- Status values: pending_faculty, pending_advisor, enrolled, rejected, withdrawn
