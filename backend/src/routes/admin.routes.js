import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { lockSemester } from "../controllers/admin.controller.js";
import { assignRole } from "../controllers/admin.controller.js";
import { createStudent } from "../controllers/admin.controller.js";
import { createFaculty, uploadGrades, assignAdvisor, adminSubmitGrade, approveGrades, getPendingGrades, bulkCreateUsers, bulkAssignAdvisors } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.post("/lock-semester", lockSemester);
router.post("/assign-role", assignRole);
router.post("/create-student", createStudent);
router.post("/create-faculty", createFaculty);
router.post("/upload-grades", uploadGrades); // Deprecated
router.post("/approve-grades", approveGrades); // New
router.get("/pending-grades", getPendingGrades); // New
router.post("/assign-advisor", assignAdvisor);
router.post("/bulk-advisors", bulkAssignAdvisors);
router.post("/bulk-users", bulkCreateUsers);
router.post("/submit-grade", adminSubmitGrade);


export default router;
