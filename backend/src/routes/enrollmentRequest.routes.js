import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Student: Request enrollment in a course
router.post(
  "/request/:courseId",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      // Check if course exists and is approved
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, status")
        .eq("id", courseId)
        .single();

      if (courseError || !course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check course approval status
      const { data: approval } = await supabase
        .from("course_approvals")
        .select("status")
        .eq("course_id", courseId)
        .single();

      if (!approval || approval.status !== "approved") {
        return res.status(400).json({ error: "Course is not approved for enrollment" });
      }

      // Check if already enrolled (enrollments table uses composite key, no id column)
      const { data: existingEnrollments } = await supabase
        .from("enrollments")
        .select("student_id, course_id, status")
        .eq("student_id", req.user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .limit(1);

      if (existingEnrollments && existingEnrollments.length > 0) {
        return res.status(400).json({ error: "You are already enrolled in this course" });
      }

      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from("enrollment_requests")
        .select("id, status")
        .eq("student_id", req.user.id)
        .eq("course_id", courseId)
        .single();

      if (existingRequest) {
        if (existingRequest.status === "pending" || existingRequest.status === "approved_by_faculty") {
          return res.status(400).json({ error: "Enrollment request already exists" });
        }
        // If rejected, allow new request
      }

      // Create enrollment request
      const { data, error } = await supabase
        .from("enrollment_requests")
        .insert([
          {
            student_id: req.user.id,
            course_id: courseId,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Enrollment request error:", error);
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ message: "Enrollment request submitted", request: data });
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Faculty: Get pending enrollment requests for their courses
router.get(
  "/pending",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    try {
      // Get faculty's courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", req.user.id);

      if (!courses || courses.length === 0) {
        return res.json([]);
      }

      const courseIds = courses.map((c) => c.id);

      // Get pending requests for these courses
      const { data: requests, error: requestsError } = await supabase
        .from("enrollment_requests")
        .select("id, status, created_at, student_id, course_id")
        .in("course_id", courseIds)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching requests:", requestsError);
        return res.status(500).json({ error: requestsError.message });
      }

      if (!requests || requests.length === 0) {
        return res.json([]);
      }

      // Get student IDs and course IDs
      const studentIds = [...new Set(requests.map((r) => r.student_id).filter(Boolean))];
      const requestCourseIds = [...new Set(requests.map((r) => r.course_id).filter(Boolean))];

      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", studentIds);

      // Fetch courses
      const { data: courseData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", requestCourseIds);

      // Create lookup maps
      const studentMap = {};
      if (students) {
        students.forEach((s) => {
          studentMap[s.id] = s;
        });
      }

      const courseMap = {};
      if (courseData) {
        courseData.forEach((c) => {
          courseMap[c.id] = c;
        });
      }

      // Combine data - filter out requests with missing data
      const result = requests
        .map((request) => {
          const student = studentMap[request.student_id];
          const course = courseMap[request.course_id];
          if (!student || !course) return null;
          return {
            id: request.id,
            status: request.status,
            created_at: request.created_at,
            student,
            course,
          };
        })
        .filter(Boolean);

      res.json(result);
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Faculty: Approve/reject enrollment request
router.patch(
  "/:requestId/faculty-action",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { action, reason } = req.body; // action: 'approve' or 'reject'

      // Get request with course info
      const { data: request, error: requestError } = await supabase
        .from("enrollment_requests")
        .select(`
          id,
          course_id,
          course:courses!course_id (
            teacher_id
          )
        `)
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        return res.status(404).json({ error: "Request not found" });
      }

      // Verify faculty owns the course
      if (request.course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (action === "approve") {
        // Update request status
        const { data, error } = await supabase
          .from("enrollment_requests")
          .update({
            status: "approved_by_faculty",
            faculty_approval_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        res.json({ message: "Request approved by faculty", request: data });
      } else if (action === "reject") {
        const { data, error } = await supabase
          .from("enrollment_requests")
          .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
            rejection_reason: reason || "Rejected by faculty",
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        res.json({ message: "Request rejected", request: data });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Faculty Advisor: Get pending requests (approved by faculty, waiting for advisor)
router.get(
  "/advisor/pending",
  authMiddleware,
  requireRole("faculty_advisor"),
  async (req, res) => {
    try {
      // Get pending requests
      const { data: requests, error: requestsError } = await supabase
        .from("enrollment_requests")
        .select("id, status, faculty_approval_at, created_at, student_id, course_id")
        .eq("status", "approved_by_faculty")
        .order("faculty_approval_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching requests:", requestsError);
        return res.status(500).json({ error: requestsError.message });
      }

      if (!requests || requests.length === 0) {
        return res.json([]);
      }

      // Get student IDs and course IDs
      const studentIds = [...new Set(requests.map((r) => r.student_id).filter(Boolean))];
      const courseIds = [...new Set(requests.map((r) => r.course_id).filter(Boolean))];

      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", studentIds);

      // Fetch courses with teacher info
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, teacher_id")
        .in("id", courseIds);

      // Get teacher IDs
      const teacherIds = [...new Set(courses?.map((c) => c.teacher_id).filter(Boolean) || [])];

      // Fetch teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", teacherIds);

      // Create lookup maps
      const studentMap = {};
      if (students) {
        students.forEach((s) => {
          studentMap[s.id] = s;
        });
      }

      const teacherMap = {};
      if (teachers) {
        teachers.forEach((t) => {
          teacherMap[t.id] = t;
        });
      }

      const courseMap = {};
      if (courses) {
        courses.forEach((c) => {
          const teacher = teacherMap[c.teacher_id];
          courseMap[c.id] = {
            id: c.id,
            title: c.title,
            teacher: teacher || null,
          };
        });
      }

      // Combine data - filter out requests with missing data
      const result = requests
        .map((request) => {
          const student = studentMap[request.student_id];
          const course = courseMap[request.course_id];
          if (!student || !course) return null;
          return {
            id: request.id,
            status: request.status,
            faculty_approval_at: request.faculty_approval_at,
            created_at: request.created_at,
            student,
            course,
          };
        })
        .filter(Boolean);

      res.json(result);
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Faculty Advisor: Approve/reject enrollment request (final approval)
router.patch(
  "/:requestId/advisor-action",
  authMiddleware,
  requireRole("faculty_advisor"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { action, reason } = req.body; // action: 'approve' or 'reject'

      // Get request
      const { data: request, error: requestError } = await supabase
        .from("enrollment_requests")
        .select("id, student_id, course_id, status")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.status !== "approved_by_faculty") {
        return res.status(400).json({ error: "Request must be approved by faculty first" });
      }

      if (action === "approve") {
        // Update request to enrolled
        const { error: updateError } = await supabase
          .from("enrollment_requests")
          .update({
            status: "enrolled",
            advisor_approval_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }

        // Create enrollment
        const { data: enrollment, error: enrollError } = await supabase
          .from("enrollments")
          .insert([
            {
              student_id: request.student_id,
              course_id: request.course_id,
              status: "active",
            },
          ])
          .select()
          .single();

        if (enrollError) {
          console.error("Enrollment creation error:", enrollError);
          // Rollback request status
          await supabase
            .from("enrollment_requests")
            .update({ status: "approved_by_faculty" })
            .eq("id", requestId);
          return res.status(400).json({ error: "Failed to create enrollment" });
        }

        res.json({ message: "Student enrolled successfully", enrollment });
      } else if (action === "reject") {
        const { data, error } = await supabase
          .from("enrollment_requests")
          .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
            rejection_reason: reason || "Rejected by faculty advisor",
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        res.json({ message: "Request rejected", request: data });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Student: Get their enrollment requests
router.get(
  "/my-requests",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    try {
      // Get requests
      const { data: requests, error: requestsError } = await supabase
        .from("enrollment_requests")
        .select("id, status, created_at, faculty_approval_at, advisor_approval_at, rejected_at, rejection_reason, course_id")
        .eq("student_id", req.user.id)
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching requests:", requestsError);
        return res.status(500).json({ error: requestsError.message });
      }

      if (!requests || requests.length === 0) {
        return res.json([]);
      }

      // Get course IDs
      const courseIds = [...new Set(requests.map((r) => r.course_id).filter(Boolean))];

      // Fetch courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description")
        .in("id", courseIds);

      // Create course lookup map
      const courseMap = {};
      if (courses) {
        courses.forEach((c) => {
          courseMap[c.id] = c;
        });
      }

      // Combine data
      const result = requests.map((request) => ({
        id: request.id,
        status: request.status,
        created_at: request.created_at,
        faculty_approval_at: request.faculty_approval_at,
        advisor_approval_at: request.advisor_approval_at,
        rejected_at: request.rejected_at,
        rejection_reason: request.rejection_reason,
        course: courseMap[request.course_id] || {
          id: request.course_id,
          title: "Unknown Course",
          description: "",
        },
      }));

      res.json(result);
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
