import express from "express";
import  authMiddleware  from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    try {
      const { assignmentId, fileUrl } = req.body;

      if (!assignmentId || !fileUrl) {
        return res.status(400).json({ error: "assignmentId and fileUrl are required" });
      }

      // Check if assignment exists
      const { data: assignment, error: assignmentError } = await supabase
        .from("assignments")
        .select("id")
        .eq("id", assignmentId)
        .single();

      if (assignmentError || !assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Check if already submitted (optional - allow resubmission)
      // If you want to prevent resubmission, uncomment this:
      // const { data: existing } = await supabase
      //   .from("submissions")
      //   .select("id")
      //   .eq("assignment_id", assignmentId)
      //   .eq("student_id", req.user.id)
      //   .single();
      // if (existing) {
      //   return res.status(400).json({ error: "Already submitted" });
      // }

      const { data, error } = await supabase
        .from("submissions")
        .insert([
          {
            assignment_id: assignmentId,
            student_id: req.user.id,
            file_url: fileUrl,
          },
        ])
        .select();

      if (error) {
        console.error("Submission insert error:", error);
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json(data[0]);
    } catch (err) {
      console.error("Unexpected error in submission:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/assignment/:assignmentId",
  authMiddleware,
  requireRole("teacher"),
  async (req, res) => {
    const { assignmentId } = req.params;

    const { data, error } = await supabase
      .from("submissions")
      .select(`
        id,
        submitted_at,
        file_url,
        student:profiles (
          id,
          name
        )
      `)
      .eq("assignment_id", assignmentId);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  }
);

router.patch(
  "/:id/grade",
  authMiddleware,
  requireRole("teacher"),
  async (req, res) => {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    // get submission + assignment + course
    const { data: submission } = await supabase
      .from("submissions")
      .select(`
        id,
        assignment:assignments (
          course_id
        )
      `)
      .eq("id", id)
      .single();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // check course ownership
    const { data: course } = await supabase
      .from("courses")
      .select("teacher_id")
      .eq("id", submission.assignment.course_id)
      .single();

    if (course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("submissions")
      .update({ marks, feedback })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data[0]);
  }
);

// Student views own submission
router.get(
  "/my/:assignmentId",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    const { assignmentId } = req.params;

    const { data, error } = await supabase
      .from("submissions")
      .select("marks, feedback, submitted_at, file_url")
      .eq("assignment_id", assignmentId)
      .eq("student_id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(data);
  }
);


export default router;
