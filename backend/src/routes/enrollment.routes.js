import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// IMPORTANT: More specific routes must come BEFORE parameterized routes

// Faculty: Directly enroll a student (bypasses approval workflow)
router.post(
    "/faculty/enroll",
    authMiddleware,
    requireRole("faculty"),
    async (req, res) => {
        const { courseId, studentId } = req.body;

        // Verify course exists and is approved
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id, teacher_id, status")
            .eq("id", courseId)
            .single();

        if (courseError || !course) {
            return res.status(404).json({ error: "Course not found" });
        }

        if (course.teacher_id !== req.user.id) {
            return res.status(403).json({ error: "You do not own this course" });
        }

        if (course.status !== "approved") {
            return res.status(400).json({ error: "Course is not approved for enrollment" });
        }

        // Verify student exists
        const { data: student, error: studentError } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", studentId)
            .single();

        if (studentError || !student) {
            return res.status(404).json({ error: "Student not found" });
        }

        if (student.role !== "student") {
            return res.status(400).json({ error: "User is not a student" });
        }

        // Check if already enrolled (enrollments table uses composite key, no id column)
        const { data: existingEnrollments } = await supabase
            .from("enrollments")
            .select("student_id, course_id, status")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("status", "active")
            .limit(1);

        if (existingEnrollments && existingEnrollments.length > 0) {
            return res.status(400).json({ error: "Student is already enrolled in this course" });
        }

        // Create enrollment directly
        const { data: enrollment, error: enrollError } = await supabase
            .from("enrollments")
            .insert([
                {
                    student_id: studentId,
                    course_id: courseId,
                    status: "active",
                },
            ])
            .select()
            .single();

        if (enrollError) {
            console.error("Enrollment insert error:", enrollError);
            return res.status(400).json({ error: enrollError.message });
        }

        res.status(201).json({ message: "Student enrolled successfully", enrollment });
    }
);

// Student: Drop a course
router.patch(
    "/drop/:courseId",
    authMiddleware,
    requireRole("student"),
    async (req, res) => {
        try {
            const { courseId } = req.params;

            // Find active enrollment (enrollments table uses composite primary key)
            const { data: enrollments, error: enrollmentError } = await supabase
                .from("enrollments")
                .select("student_id, course_id, status")
                .eq("student_id", req.user.id)
                .eq("course_id", courseId)
                .eq("status", "active")
                .limit(1);

            if (enrollmentError) {
                console.error("Enrollment check error:", enrollmentError);
                return res.status(500).json({ error: "Error checking enrollment" });
            }

            if (!enrollments || enrollments.length === 0) {
                return res.status(404).json({ error: "You are not enrolled in this course" });
            }

            // Update enrollment status to dropped (using composite key)
            const { data, error } = await supabase
                .from("enrollments")
                .update({
                    status: "dropped",
                })
                .eq("student_id", req.user.id)
                .eq("course_id", courseId)
                .select()
                .single();

            if (error) {
                console.error("Drop error:", error);
                return res.status(400).json({ error: error.message });
            }

            res.json({ message: "Course dropped successfully", enrollment: data });
        } catch (err) {
            console.error("Unexpected error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Student: Withdraw from a course
router.patch(
    "/withdraw/:courseId",
    authMiddleware,
    requireRole("student"),
    async (req, res) => {
        try {
            const { courseId } = req.params;

            // Find active enrollment (enrollments table uses composite primary key)
            const { data: enrollments, error: enrollmentError } = await supabase
                .from("enrollments")
                .select("student_id, course_id, status")
                .eq("student_id", req.user.id)
                .eq("course_id", courseId)
                .eq("status", "active")
                .limit(1);

            if (enrollmentError) {
                console.error("Enrollment check error:", enrollmentError);
                return res.status(500).json({ error: "Error checking enrollment" });
            }

            if (!enrollments || enrollments.length === 0) {
                return res.status(404).json({ error: "You are not enrolled in this course" });
            }

            // Update enrollment status to withdrawn (using composite key)
            const { data, error } = await supabase
                .from("enrollments")
                .update({
                    status: "withdrawn",
                    withdrawn_at: new Date().toISOString(),
                })
                .eq("student_id", req.user.id)
                .eq("course_id", courseId)
                .select()
                .single();

            if (error) {
                console.error("Withdraw error:", error);
                return res.status(400).json({ error: error.message });
            }

            res.json({ message: "Course withdrawn successfully", enrollment: data });
        } catch (err) {
            console.error("Unexpected error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

router.get("/my", authMiddleware, async (req, res) => {
    try {
        // Get enrollments (enrollments table uses composite key, no id column)
        const { data: enrollments, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("course_id, enrolled_at, status, withdrawn_at, student_id")
            .eq("student_id", req.user.id)
            .in("status", ["active", "dropped", "withdrawn"]);

        if (enrollmentError) {
            console.error("Error fetching enrollments:", enrollmentError);
            return res.status(500).json({ error: enrollmentError.message });
        }

        if (!enrollments || enrollments.length === 0) {
            return res.json([]);
        }

        // Get course IDs
        const courseIds = enrollments.map((e) => e.course_id);

        // Fetch courses
        const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select("id, title, description, teacher_id, created_at")
            .in("id", courseIds);

        if (coursesError) {
            console.error("Error fetching courses:", coursesError);
            return res.status(500).json({ error: coursesError.message });
        }

        // Create course lookup map
        const courseMap = {};
        if (courses) {
            courses.forEach((c) => {
                courseMap[c.id] = c;
            });
        }

        // Combine enrollment and course data
        const result = enrollments.map((enrollment) => ({
            course_id: enrollment.course_id,
            enrolled_at: enrollment.enrolled_at,
            status: enrollment.status,
            withdrawn_at: enrollment.withdrawn_at,
            course: courseMap[enrollment.course_id] || {
                id: enrollment.course_id,
                title: "Unknown Course",
                description: "",
            },
        }));

        res.json(result);
    } catch (err) {
        console.error("Unexpected enrollment error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// View students in course - accessible to all authenticated users
router.get(
    "/course/:courseId",
    authMiddleware,
    async (req, res) => {
        try {
            const { courseId } = req.params;

            // Check if course exists
            const { data: course, error: courseError } = await supabase
                .from("courses")
                .select("teacher_id")
                .eq("id", courseId)
                .single();

            if (courseError || !course) {
                return res.status(404).json({ error: "Course not found" });
            }

            // For faculty, ensure they own the course
            if (req.user.role === "faculty" || req.user.role === "teacher") {
                if (course.teacher_id !== req.user.id) {
                    return res.status(403).json({ error: "Unauthorized" });
                }
            }

            // Get enrollments
            const { data: enrollments, error: enrollmentError } = await supabase
                .from("enrollments")
                .select("student_id, status, enrolled_at, withdrawn_at")
                .eq("course_id", courseId)
                .eq("status", "active");

            if (enrollmentError) {
                console.error("Error fetching enrollments:", enrollmentError);
                return res.status(500).json({ error: enrollmentError.message });
            }

            if (!enrollments || enrollments.length === 0) {
                return res.json([]);
            }

            // Get student IDs
            const studentIds = enrollments.map((e) => e.student_id);

            // Fetch student profiles
            const { data: students, error: studentsError } = await supabase
                .from("profiles")
                .select("id, name")
                .in("id", studentIds);

            if (studentsError) {
                console.error("Error fetching students:", studentsError);
                return res.status(500).json({ error: studentsError.message });
            }

            // Create student lookup map
            const studentMap = {};
            if (students) {
                students.forEach((s) => {
                    studentMap[s.id] = s;
                });
            }

            // Combine enrollment data with student info
            const result = enrollments.map((enrollment) => ({
                ...studentMap[enrollment.student_id],
                enrollment_status: enrollment.status,
                enrolled_at: enrollment.enrolled_at,
                withdrawn_at: enrollment.withdrawn_at,
            }));

            res.json(result);
        } catch (err) {
            console.error("Unexpected error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Admin and Faculty Advisor: Get all enrollments
router.get(
    "/all",
    authMiddleware,
    requireRole(["admin", "faculty_advisor"]),
    async (req, res) => {
        try {
            // Get all enrollments
            const { data: enrollments, error: enrollmentError } = await supabase
                .from("enrollments")
                .select("student_id, course_id, status, enrolled_at, withdrawn_at");

            if (enrollmentError) {
                console.error("Error fetching enrollments:", enrollmentError);
                return res.status(500).json({ error: enrollmentError.message });
            }

            if (!enrollments || enrollments.length === 0) {
                return res.json([]);
            }

            // Get student IDs and course IDs
            const studentIds = [...new Set(enrollments.map((e) => e.student_id).filter(Boolean))];
            const courseIds = [...new Set(enrollments.map((e) => e.course_id).filter(Boolean))];

            // Fetch students
            const { data: students, error: studentsError } = await supabase
                .from("profiles")
                .select("id, name")
                .in("id", studentIds);

            // Fetch courses
            const { data: courses, error: coursesError } = await supabase
                .from("courses")
                .select("id, title")
                .in("id", courseIds);

            // Create lookup maps
            const studentMap = {};
            if (students) {
                students.forEach((s) => {
                    studentMap[s.id] = s;
                });
            }

            const courseMap = {};
            if (courses) {
                courses.forEach((c) => {
                    courseMap[c.id] = c;
                });
            }

            // Combine data
            const result = enrollments.map((enrollment) => ({
                student_id: enrollment.student_id,
                course_id: enrollment.course_id,
                status: enrollment.status,
                enrolled_at: enrollment.enrolled_at,
                withdrawn_at: enrollment.withdrawn_at,
                student: studentMap[enrollment.student_id] || { id: enrollment.student_id, name: "Unknown", email: "" },
                course: courseMap[enrollment.course_id] || { id: enrollment.course_id, title: "Unknown Course" },
            }));

            res.json(result);
        } catch (err) {
            console.error("Unexpected error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

export default router;
