-- Database Migration Scripts
-- Run these in your Supabase SQL Editor

-- ============================================
-- 1. Update profiles table role constraint
-- ============================================

-- Drop the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with all required roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (
    ARRAY[
      'student'::text,
      'teacher'::text,
      'faculty'::text,
      'faculty_advisor'::text,
      'admin'::text
    ]
  )
);

-- ============================================
-- 2. Update existing teacher roles to faculty (optional)
-- ============================================

-- Uncomment this if you want to migrate existing teachers to faculty
-- UPDATE public.profiles SET role = 'faculty' WHERE role = 'teacher';

-- ============================================
-- 3. Ensure courses table has status column
-- ============================================

-- Add status column if it doesn't exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_approval';

-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_status_check'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_status_check CHECK (
      status = ANY (
        ARRAY[
          'pending_approval'::text,
          'pending_advisor'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    );
  END IF;
END $$;

-- ============================================
-- 4. Ensure enrollments table has status and withdrawn_at columns
-- ============================================

-- Add status column if it doesn't exist
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add withdrawn_at column if it doesn't exist
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP;

-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_status_check'
  ) THEN
    ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_status_check CHECK (
      status = ANY (
        ARRAY[
          'active'::text,
          'dropped'::text,
          'withdrawn'::text
        ]
      )
    );
  END IF;
END $$;

-- ============================================
-- 5. Update existing courses to approved status (if needed)
-- ============================================

-- Uncomment this if you want to auto-approve existing courses
-- UPDATE public.courses SET status = 'approved' WHERE status IS NULL OR status = 'pending_approval';

-- ============================================
-- 6. Create course approvals for existing approved courses
-- ============================================

-- Insert course approvals for courses that are already approved
INSERT INTO public.course_approvals (course_id, status, admin_approval_at, advisor_approval_at, created_at, updated_at)
SELECT 
  id,
  'approved',
  NOW(),
  NOW(),
  created_at,
  NOW()
FROM public.courses
WHERE status = 'approved'
ON CONFLICT (course_id) DO NOTHING;

-- ============================================
-- 7. Create course approvals for pending courses
-- ============================================

-- Insert course approvals for courses that are pending
INSERT INTO public.course_approvals (course_id, status, created_at, updated_at)
SELECT 
  id,
  'pending_admin',
  created_at,
  NOW()
FROM public.courses
WHERE status = 'pending_approval' OR status IS NULL
ON CONFLICT (course_id) DO NOTHING;

-- ============================================
-- 8. Update existing enrollments to active status
-- ============================================

-- Set status to active for existing enrollments without status
UPDATE public.enrollments SET status = 'active' WHERE status IS NULL;

-- ============================================
-- 9. Create indexes for better performance (if not exists)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_status ON public.enrollments(student_id, status);

-- ============================================
-- 10. Verify tables and constraints
-- ============================================

-- Check profiles roles
SELECT DISTINCT role FROM public.profiles;

-- Check courses statuses
SELECT DISTINCT status FROM public.courses;

-- Check enrollments statuses
SELECT DISTINCT status FROM public.enrollments;

-- Check course approvals
SELECT COUNT(*) as total_approvals, status, COUNT(*) FILTER (WHERE status = 'approved') as approved_count
FROM public.course_approvals
GROUP BY status;
