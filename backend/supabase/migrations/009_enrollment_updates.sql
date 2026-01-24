-- Add enrollment_type to enrollments
ALTER TABLE enrollments
ADD COLUMN enrollment_type TEXT NOT NULL DEFAULT 'credit' CHECK (enrollment_type IN ('credit', 'minor', 'concentration'));
