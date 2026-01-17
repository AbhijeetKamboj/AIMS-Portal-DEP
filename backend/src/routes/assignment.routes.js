import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    const { courseId, title, description, dueDate } = req.body;

    // ownership check
    const { data: course } = await supabase
      .from("courses")
      .select("teacher_id")
      .eq("id", courseId)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("assignments")
      .insert([
        {
          course_id: courseId,
          title,
          description,
          due_date: dueDate,
        },
      ])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data[0]);
  }
);

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
      .from("assignments")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  }
);


export default router;
