import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    enrollCourse,
    getTranscript,
    getCgpa,
    listOfferings,
    getMyEnrollments,
    getSemesterGPA
} from "../controllers/student.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("student"));

router.post("/enroll", enrollCourse);
router.get("/transcript", getTranscript);
router.get("/cgpa", getCgpa);
router.get("/offerings", listOfferings);
router.get("/my-enrollments", getMyEnrollments);
router.get("/semester-gpa", getSemesterGPA);

export default router;
