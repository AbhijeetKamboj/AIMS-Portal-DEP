import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload assignment file
router.post(
  "/assignment",
  authMiddleware,
  requireRole("student"),
  upload.single("file"),
  async (req, res) => {
    try {
      // =========================
      // 1. Validate request
      // =========================
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const { courseId, assignmentId } = req.body;

      if (!courseId || !assignmentId) {
        return res.status(400).json({
          error: "courseId and assignmentId are required",
        });
      }

      console.log(
        "Upload request:",
        "courseId =", courseId,
        "assignmentId =", assignmentId,
        "userId =", req.user.id
      );

      // =========================
      // 2. Verify assignment
      // =========================
      const { data: assignment, error: assignmentError } = await supabase
        .from("assignments")
        .select("id, course_id")
        .eq("id", assignmentId)
        .single();

      if (assignmentError || !assignment) {
        console.error("Assignment not found:", assignmentError);
        return res.status(404).json({ error: "Assignment not found" });
      }

      if (String(assignment.course_id) !== String(courseId)) {
        return res.status(400).json({ error: "Course ID mismatch" });
      }

      const actualCourseId = assignment.course_id;

      // =========================
      // 3. Check enrollment
      // =========================
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("student_id, course_id, status")
        .eq("student_id", req.user.id)
        .eq("course_id", actualCourseId)
        .eq("status", "active")
        .limit(1);

      if (enrollmentError) {
        console.error("Enrollment check error:", enrollmentError);
        return res.status(500).json({
          error: `Error checking enrollment: ${enrollmentError.message}`,
        });
      }

      if (!enrollments || enrollments.length === 0) {
        console.error(
          `Student ${req.user.id} not enrolled in course ${actualCourseId}`
        );

        const { data: allEnrollments } = await supabase
          .from("enrollments")
          .select("course_id, status")
          .eq("student_id", req.user.id);

        return res.status(403).json({
          error: "You are not enrolled in this course or enrollment is inactive",
          debug: {
            studentId: req.user.id,
            courseId: actualCourseId,
            allEnrollments,
          },
        });
      }

      // =========================
      // 4. Upload file
      // =========================
      const filePath = `${courseId}/${assignmentId}/${req.user.id}_${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return res.status(500).json({
          error: `Upload failed: ${uploadError.message}`,
        });
      }

      // =========================
      // 5. Get public URL
      // =========================
      const { data: urlData } = supabase.storage
        .from("assignments")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return res.status(500).json({
          error: "Failed to generate file URL",
        });
      }

      // =========================
      // 6. Success
      // =========================
      return res.status(200).json({
        fileUrl: urlData.publicUrl,
        path: filePath,
      });
    } catch (err) {
      console.error("Unexpected error in file upload:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
