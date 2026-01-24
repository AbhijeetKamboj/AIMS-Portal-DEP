import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    createCourse,
    offerCourse,
    approveOffering,
    getApprovedOfferings,
    getAllOfferings,
    getCourses,
    getSemesters,
    getOfferedCourses,
    approveCourseCatalog,
    getCourseEnrollments,
    getCourseById
} from "../controllers/course.controller.js";

const router = express.Router();

router.use(authMiddleware);

// Public (Authenticated) - Specific routes first
router.get("/offerings", getApprovedOfferings);
router.get("/list", getCourses);
router.get("/semesters", getSemesters);
router.get("/offered-courses", getOfferedCourses);
router.get("/enrollments", getCourseEnrollments);

// Admin Routes - Specific routes before generic :id
router.get("/all-offerings", requireRole("admin"), getAllOfferings);
router.post("/create", requireRole(["faculty", "admin"]), createCourse);
router.post("/approve-offering", requireRole("admin"), approveOffering);
router.post("/approve-catalog", requireRole("admin"), approveCourseCatalog);

// Generic route - MUST be last
router.get("/:id", getCourseById);

// Faculty Routes
router.post("/offer", requireRole("faculty"), offerCourse);

export default router;
