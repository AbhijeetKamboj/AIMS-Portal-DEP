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

// Public (Authenticated)
router.get("/offerings", getApprovedOfferings);
router.get("/list", getCourses);
router.get("/semesters", getSemesters);
router.get("/offered-courses", getOfferedCourses);
router.get("/enrollments", getCourseEnrollments);
router.get("/:id", getCourseById);

// Admin Routes
router.post("/create", requireRole(["faculty", "admin"]), createCourse);
router.post("/approve-offering", requireRole("admin"), approveOffering);
router.post("/approve-catalog", requireRole("admin"), approveCourseCatalog);
router.get("/all-offerings", requireRole("admin"), getAllOfferings);

// Faculty Routes
router.post("/offer", requireRole("faculty"), offerCourse);

export default router;
