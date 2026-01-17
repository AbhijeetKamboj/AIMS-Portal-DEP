import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Get all approved courses (for students to view)
// Admin can see all courses
router.get("/", authMiddleware, async (req, res) => {
  try {
    // If admin, return all courses
    if (req.user.role === "admin") {
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description, status, created_at, teacher_id");

      if (coursesError) {
        return res.status(500).json({ error: coursesError.message });
      }

      // Get teacher IDs
      const teacherIds = [...new Set(courses.map((c) => c.teacher_id).filter(Boolean))];

      // Fetch teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", teacherIds);

      // Create teacher map
      const teacherMap = {};
      if (teachers) {
        teachers.forEach((t) => {
          teacherMap[t.id] = t;
        });
      }

      // Combine data
      const result = courses.map((course) => ({
        ...course,
        teacher: teacherMap[course.teacher_id] || { id: course.teacher_id, name: "Unknown", email: "" },
      }));

      return res.json(result);
    }

    // For others, return only approved courses
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, description, status")
      .eq("status", "approved");

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Faculty: get my courses
router.get(
  "/my",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, description, status")
      .eq("teacher_id", req.user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  }
);

// Faculty: create a new course (requires approval)
router.post(
    "/",
    authMiddleware,
    requireRole("faculty"),
    async (req, res) => {
        const {title, description} = req.body;

        // Create course with pending status
        const {data: course, error: courseError} = await supabase.from("courses").insert([
            {
                title,
                description,
                teacher_id: req.user.id,
                status: "pending_approval",
            },
    ]).select().single();

    if(courseError){
        return res.status(500).json({error: courseError.message});
    }

    // Create course approval request
    const {error: approvalError} = await supabase.from("course_approvals").insert([
        {
            course_id: course.id,
            status: "pending_admin",
        },
    ]);

    if(approvalError){
        console.error("Course approval creation error:", approvalError);
        // Course created but approval failed - still return success
    }

    res.status(201).json({
        ...course,
        message: "Course created. Awaiting admin and advisor approval."
    });
    }
);

// Get course details
router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    const { id } = req.params;

    // First get the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, description, teacher_id")
      .eq("id", id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Then get the teacher profile
    const { data: teacher, error: teacherError } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("id", course.teacher_id)
      .single();

    // Return course with teacher info
    res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      teacher: teacher || { id: course.teacher_id, name: "Unknown" },
    });
  }
);


export default router;