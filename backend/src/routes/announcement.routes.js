import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Faculty creates announcement
router.post(
  "/",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    const { courseId, message } = req.body;

    // check ownership
    const { data: course } = await supabase
      .from("courses")
      .select("teacher_id")
      .eq("id", courseId)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert([{ course_id: courseId, message }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  }
);

// Get announcements for a course
router.get(
  "/course/:courseId",
  authMiddleware,
  async (req, res) => {
    const { courseId } = req.params;

    // students must be enrolled
    if (req.user.role === "student") {
      const { data: enrolled } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("student_id", req.user.id)
        .eq("course_id", courseId)
        .single();

      if (!enrolled) {
        return res.status(403).json({ error: "Not enrolled" });
      }
    }

    const { data, error } = await supabase
      .from("announcements")
      .select("id, message, created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  }
);

export default router;
