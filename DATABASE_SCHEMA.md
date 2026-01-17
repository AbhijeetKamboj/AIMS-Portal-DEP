# Database Schema for Enrollment Workflow

## Required Tables

### 1. Update profiles table
Add support for new roles:
- `student`
- `teacher` (backward compatibility - maps to faculty)
- `faculty` (replaces `teacher`)
- `faculty_advisor`
- `admin`

**IMPORTANT**: Run the migration script `DATABASE_MIGRATIONS.sql` to update the role constraint.

### 2. enrollment_requests table
```sql
CREATE TABLE enrollment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved_by_faculty', 'approved_by_advisor', 'enrolled', 'rejected'
  faculty_approval_at TIMESTAMP,
  advisor_approval_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Indexes
CREATE INDEX idx_enrollment_requests_student ON enrollment_requests(student_id);
CREATE INDEX idx_enrollment_requests_course ON enrollment_requests(course_id);
CREATE INDEX idx_enrollment_requests_status ON enrollment_requests(status);
```

### 3. course_approvals table
```sql
CREATE TABLE course_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_admin', -- 'pending_admin', 'pending_advisor', 'approved', 'rejected'
  admin_approval_at TIMESTAMP,
  advisor_approval_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Indexes
CREATE INDEX idx_course_approvals_course ON course_approvals(course_id);
CREATE INDEX idx_course_approvals_status ON course_approvals(status);
```

### 4. Update courses table
Add `status` field:
```sql
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_approval';
-- Values: 'pending_approval', 'approved', 'rejected'
```

### 5. Update enrollments table
Add `status` and `withdrawn_at` fields:
```sql
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP;
-- Status values: 'active', 'dropped', 'withdrawn'
```
