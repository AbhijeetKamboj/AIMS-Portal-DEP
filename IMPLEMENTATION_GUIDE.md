# Enrollment Workflow Implementation Guide

## ✅ Backend Implementation Complete

### What's Been Implemented:

1. **Fixed Enrollment Check Error**
   - Updated upload route to handle RLS errors gracefully
   - Added better error handling and debugging

2. **New Role System**
   - Updated middleware to support: `student`, `faculty`, `faculty_advisor`, `admin`
   - Added backward compatibility for `teacher` → `faculty` mapping

3. **Enrollment Request Workflow**
   - Students request enrollment → Faculty approves → Advisor approves → Student enrolled
   - Routes: `/api/enrollment-requests/*`

4. **Course Approval Workflow**
   - Faculty creates course → Admin approves → Advisor approves → Course available
   - Routes: `/api/course-approvals/*`

5. **Drop/Withdraw Functionality**
   - Students can drop or withdraw from courses
   - Routes: `/api/enrollments/drop/:courseId`, `/api/enrollments/withdraw/:courseId`

6. **Faculty Direct Enrollment**
   - Faculty can still directly enroll students (bypasses approval)
   - Route: `/api/enrollments/faculty/enroll`

## 📋 Database Setup Required

### Step 1: Run SQL Scripts

Execute the SQL from `DATABASE_SCHEMA.md` in your Supabase SQL editor:

1. Create `enrollment_requests` table
2. Create `course_approvals` table
3. Update `courses` table (add `status` column)
4. Update `enrollments` table (add `status` and `withdrawn_at` columns)
5. Update `profiles` table roles (ensure support for new roles)

### Step 2: Update Existing Data

```sql
-- Update existing courses to approved status (if needed)
UPDATE courses SET status = 'approved' WHERE status IS NULL;

-- Update existing enrollments to active status
UPDATE enrollments SET status = 'active' WHERE status IS NULL;

-- Create course approvals for existing approved courses
INSERT INTO course_approvals (course_id, status, admin_approval_at, advisor_approval_at)
SELECT id, 'approved', NOW(), NOW()
FROM courses
WHERE status = 'approved'
ON CONFLICT (course_id) DO NOTHING;
```

## 🔄 API Endpoints Summary

### Enrollment Requests
- `POST /api/enrollment-requests/request/:courseId` - Student requests enrollment
- `GET /api/enrollment-requests/pending` - Faculty sees pending requests
- `PATCH /api/enrollment-requests/:requestId/faculty-action` - Faculty approve/reject
- `GET /api/enrollment-requests/advisor/pending` - Advisor sees pending requests
- `PATCH /api/enrollment-requests/:requestId/advisor-action` - Advisor approve/reject (final)
- `GET /api/enrollment-requests/my-requests` - Student sees their requests

### Course Approvals
- `GET /api/course-approvals/pending` - Admin sees pending courses
- `PATCH /api/course-approvals/:approvalId/admin-action` - Admin approve/reject
- `GET /api/course-approvals/advisor/pending` - Advisor sees pending courses
- `PATCH /api/course-approvals/:approvalId/advisor-action` - Advisor approve/reject (final)
- `GET /api/course-approvals/my-courses` - Faculty sees their course approvals

### Enrollments
- `POST /api/enrollments/faculty/enroll` - Faculty directly enrolls student
- `PATCH /api/enrollments/drop/:courseId` - Student drops course
- `PATCH /api/enrollments/withdraw/:courseId` - Student withdraws from course
- `GET /api/enrollments/my` - Get my enrollments (includes status)
- `GET /api/enrollments/course/:courseId` - Faculty sees enrolled students

## 🎨 Frontend Updates Needed

### 1. Update Signup Page
- Add role options: `student`, `faculty`, `faculty_advisor`, `admin`

### 2. Student Dashboard
- Show enrollment requests status
- Add "Request Enrollment" button instead of direct enroll
- Show drop/withdraw options for enrolled courses
- Display only approved courses

### 3. Faculty Dashboard
- Show course approval status
- Add "Pending Enrollment Requests" section
- Update "Enroll Student" to use new endpoint

### 4. Admin Dashboard (New)
- Show pending course approvals
- Approve/reject courses

### 5. Faculty Advisor Dashboard (New)
- Show pending enrollment requests
- Show pending course approvals
- Approve/reject both

### 6. Update Course Detail Page
- Check course approval status before allowing enrollments
- Show enrollment request status for students

## 🚀 Next Steps

1. **Run Database Migrations** - Execute SQL from `DATABASE_SCHEMA.md`
2. **Update Frontend** - Implement UI for new workflows
3. **Test Workflows**:
   - Course creation → Admin approval → Advisor approval
   - Enrollment request → Faculty approval → Advisor approval
   - Drop/withdraw functionality
4. **Update Role Assignments** - Ensure users have correct roles in database

## 📝 Notes

- The system maintains backward compatibility with `teacher` role (maps to `faculty`)
- Enrollment check in upload route now properly handles active enrollments
- All routes include proper error handling and validation
- Course status must be "approved" before enrollments can occur
