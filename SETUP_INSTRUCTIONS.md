# Setup Instructions

## Quick Start Guide

### 1. Database Setup (Supabase)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run Migration Script**
   - Copy and paste the contents of `DATABASE_MIGRATIONS.sql`
   - Execute the script
   - This will:
     - Update role constraints to support new roles
     - Add missing columns (status, withdrawn_at)
     - Create course approvals for existing courses
     - Set up proper indexes

3. **Verify Setup**
   - Check that all tables exist
   - Verify role constraints allow: student, teacher, faculty, faculty_advisor, admin
   - Check that course_approvals and enrollment_requests tables exist

### 2. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file has:
   ```
   PORT=5050
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Start Backend**
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. **Environment Variables**
   Ensure your `.env` file has:
   ```
   VITE_BACKEND_URL=http://localhost:5050/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Start Frontend**
   ```bash
   cd web
   npm run dev
   ```

### 4. Create Test Users

After running migrations, create test users with different roles:

1. **Student**
   - Sign up with role: `student`
   - Email: student@test.com

2. **Faculty**
   - Sign up with role: `faculty`
   - Email: faculty@test.com

3. **Admin**
   - Sign up with role: `admin`
   - Email: admin@test.com

4. **Faculty Advisor**
   - Sign up with role: `faculty_advisor`
   - Email: advisor@test.com

### 5. Test Workflow

#### Course Creation & Approval:
1. Login as Faculty
2. Create a course
3. Login as Admin → Approve course
4. Login as Faculty Advisor → Approve course
5. Course should now be available for enrollment

#### Enrollment Workflow:
1. Login as Student
2. Browse courses → Request enrollment
3. Login as Faculty → Approve enrollment request
4. Login as Faculty Advisor → Approve enrollment request
5. Student should now be enrolled

#### Direct Enrollment (Faculty):
1. Login as Faculty
2. Go to "My Courses"
3. Click "Enroll Student"
4. Enter student email
5. Student is enrolled directly (bypasses approval)

#### Drop/Withdraw:
1. Login as Student
2. Go to "My Courses"
3. Click "Drop" or "Withdraw"
4. Course status updates accordingly

## Troubleshooting

### Issue: "Access Denied" errors
- Check that user roles are correctly set in `profiles` table
- Verify role constraint allows the role you're using

### Issue: Courses not showing
- Ensure courses have `status = 'approved'`
- Check that course_approvals table has entries with `status = 'approved'`

### Issue: Enrollment requests not working
- Verify enrollment_requests table exists
- Check that course is approved before requesting enrollment

### Issue: File upload fails
- Ensure Supabase storage bucket "assignments" exists
- Check bucket permissions (should allow authenticated uploads)
- Verify backend has SUPABASE_SERVICE_ROLE_KEY set

## Database Schema Verification

Run this query to verify your setup:

```sql
-- Check roles
SELECT DISTINCT role FROM profiles;

-- Check course statuses
SELECT COUNT(*), status FROM courses GROUP BY status;

-- Check enrollment statuses
SELECT COUNT(*), status FROM enrollments GROUP BY status;

-- Check course approvals
SELECT COUNT(*), status FROM course_approvals GROUP BY status;

-- Check enrollment requests
SELECT COUNT(*), status FROM enrollment_requests GROUP BY status;
```

All should return expected values based on your data.
