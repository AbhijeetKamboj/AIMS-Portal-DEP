import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Faculty searches student by email
router.get(
  "/",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      // Use admin API to find user by email
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        console.error("Error listing users:", usersError);
        return res.status(500).json({ error: "Failed to search for student" });
      }

      // Find user by email
      const user = usersData.users.find(
        (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Get student profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      // Verify it's actually a student
      if (profile.role !== "student") {
        return res.status(400).json({ error: "User is not a student" });
      }

      res.json({ id: profile.id, name: profile.name });
    } catch (err) {
      console.error("Error in student search:", err);
      res.status(500).json({ error: "An error occurred while searching for student" });
    }
  }
);

export default router;
