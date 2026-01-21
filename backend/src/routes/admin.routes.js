import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { lockSemester } from "../controllers/admin.controller.js";
import { assignRole } from "../controllers/admin.controller.js";
import { createStudent } from "../controllers/admin.controller.js";
import { createFaculty, uploadGrades, assignAdvisor, adminSubmitGrade } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.post("/lock-semester", lockSemester);
router.post("/assign-role", assignRole);
router.post("/create-student", createStudent);
router.post("/create-faculty", createFaculty);
router.post("/upload-grades", uploadGrades);
router.post("/assign-advisor", assignAdvisor);
router.post("/submit-grade", adminSubmitGrade);


export default router;
