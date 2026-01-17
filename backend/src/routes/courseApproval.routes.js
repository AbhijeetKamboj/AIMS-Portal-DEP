import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Admin: Get pending course approvals
router.get(
  "/pending",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      // First get the approvals
      const { data: approvals, error: approvalsError } = await supabase
        .from("course_approvals")
        .select("id, status, created_at, course_id")
        .eq("status", "pending_admin")
        .order("created_at", { ascending: false });

      if (approvalsError) {
        console.error("Error fetching approvals:", approvalsError);
        return res.status(500).json({ error: approvalsError.message });
      }

      if (!approvals || approvals.length === 0) {
        return res.json([]);
      }

      // Get course IDs
      const courseIds = approvals.map((a) => a.course_id);

      // Fetch courses with teacher info
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description, teacher_id")
        .in("id", courseIds);

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
        return res.status(500).json({ error: coursesError.message });
      }

      // Get teacher IDs
      const teacherIds = [...new Set(courses.map((c) => c.teacher_id).filter(Boolean))];

      // Fetch teacher profiles
      const { data: teachers, error: teachersError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", teacherIds);

      if (teachersError) {
        console.error("Error fetching teachers:", teachersError);
        // Continue without teacher info
      }

      // Create teacher lookup map
      const teacherMap = {};
      if (teachers) {
        teachers.forEach((t) => {
          teacherMap[t.id] = t;
        });
      }

      // Create course lookup map
      const courseMap = {};
      courses.forEach((c) => {
        const teacher = teacherMap[c.teacher_id];
        courseMap[c.id] = {
          ...c,
          teacher: teacher || null,
        };
      });

      // Combine approvals with course data
      const result = approvals.map((approval) => {
        const course = courseMap[approval.course_id];
        if (!course) {
          // If course not found, try to fetch it
          return {
            id: approval.id,
            status: approval.status,
            created_at: approval.created_at,
            course: null,
          };
        }
        return {
          id: approval.id,
          status: approval.status,
          created_at: approval.created_at,
          course,
        };
      }).filter((approval) => approval.course !== null);

      res.json(result);
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin: Approve/reject course
router.patch(
  "/:approvalId/admin-action",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { approvalId } = req.params;
      const { action, reason } = req.body; // action: 'approve' or 'reject'

      const { data: approval, error: approvalError } = await supabase
        .from("course_approvals")
        .select("id, course_id, status")
        .eq("id", approvalId)
        .single();

      if (approvalError || !approval) {
        return res.status(404).json({ error: "Approval not found" });
      }

      if (approval.status !== "pending_admin") {
        return res.status(400).json({ error: "Course is not pending admin approval" });
      }

      if (action === "approve") {
        // Update approval status
        const { error: updateError } = await supabase
          .from("course_approvals")
          .update({
            status: "pending_advisor",
            admin_approval_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }

        // Update course status
        await supabase
          .from("courses")
          .update({ status: "pending_advisor" })
          .eq("id", approval.course_id);

        res.json({ message: "Course approved by admin, pending advisor approval" });
      } else if (action === "reject") {
        const { error: updateError } = await supabase
          .from("course_approvals")
          .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
            rejection_reason: reason || "Rejected by admin",
            updated_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }

        // Update course status
        await supabase
          .from("courses")
          .update({ status: "rejected" })
          .eq("id", approval.course_id);

        res.json({ message: "Course rejected" });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Faculty Advisor: Get pending course approvals (approved by admin)
router.get(
  "/advisor/pending",
  authMiddleware,
  requireRole("faculty_advisor"),
  async (req, res) => {
    try {
      // First get the approvals
      const { data: approvals, error: approvalsError } = await supabase
        .from("course_approvals")
        .select("id, status, admin_approval_at, created_at, course_id")
        .eq("status", "pending_advisor")
        .order("admin_approval_at", { ascending: false });

      if (approvalsError) {
        console.error("Error fetching approvals:", approvalsError);
        return res.status(500).json({ error: approvalsError.message });
      }

      if (!approvals || approvals.length === 0) {
        return res.json([]);
      }

      // Get course IDs
      const courseIds = approvals.map((a) => a.course_id);

      // Fetch courses with teacher info
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description, teacher_id")
        .in("id", courseIds);

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
        return res.status(500).json({ error: coursesError.message });
      }

      // Get teacher IDs
      const teacherIds = [...new Set(courses.map((c) => c.teacher_id).filter(Boolean))];

      // Fetch teacher profiles
      const { data: teachers, error: teachersError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", teacherIds);

      if (teachersError) {
        console.error("Error fetching teachers:", teachersError);
        // Continue without teacher info
      }

      // Create teacher lookup map
      const teacherMap = {};
      if (teachers) {
        teachers.forEach((t) => {
          teacherMap[t.id] = t;
        });
      }

      // Create course lookup map
      const courseMap = {};
      courses.forEach((c) => {
        const teacher = teacherMap[c.teacher_id];
        courseMap[c.id] = {
          ...c,
          teacher: teacher || null,
        };
      });

      // Combine approvals with course data - filter out missing courses
      const result = approvals
        .map((approval) => {
          const course = courseMap[approval.course_id];
          if (!course) return null;
          return {
            id: approval.id,
            status: approval.status,
            admin_approval_at: approval.admin_approval_at,
            created_at: approval.created_at,
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

// Faculty Advisor: Approve/reject course (final approval)
router.patch(
  "/:approvalId/advisor-action",
  authMiddleware,
  requireRole("faculty_advisor"),
  async (req, res) => {
    try {
      const { approvalId } = req.params;
      const { action, reason } = req.body; // action: 'approve' or 'reject'

      const { data: approval, error: approvalError } = await supabase
        .from("course_approvals")
        .select("id, course_id, status")
        .eq("id", approvalId)
        .single();

      if (approvalError || !approval) {
        return res.status(404).json({ error: "Approval not found" });
      }

      if (approval.status !== "pending_advisor") {
        return res.status(400).json({ error: "Course is not pending advisor approval" });
      }

      if (action === "approve") {
        // Update approval status
        const { error: updateError } = await supabase
          .from("course_approvals")
          .update({
            status: "approved",
            advisor_approval_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }

        // Update course status
        await supabase
          .from("courses")
          .update({ status: "approved" })
          .eq("id", approval.course_id);

        res.json({ message: "Course approved and ready for enrollment" });
      } else if (action === "reject") {
        const { error: updateError } = await supabase
          .from("course_approvals")
          .update({
            status: "rejected",
            rejected_at: new Date().toISOString(),
            rejection_reason: reason || "Rejected by faculty advisor",
            updated_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }

        // Update course status
        await supabase
          .from("courses")
          .update({ status: "rejected" })
          .eq("id", approval.course_id);

        res.json({ message: "Course rejected" });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Faculty: Get their course approval status
router.get(
  "/my-courses",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", req.user.id);

      if (!courses || courses.length === 0) {
        return res.json([]);
      }

      const courseIds = courses.map((c) => c.id);

      const { data, error } = await supabase
        .from("course_approvals")
        .select(`
          id,
          status,
          created_at,
          admin_approval_at,
          advisor_approval_at,
          rejected_at,
          rejection_reason,
          course:courses!course_id (
            id,
            title,
            description
          )
        `)
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching approvals:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
