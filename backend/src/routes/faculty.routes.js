import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    submitGrade,
    approveAllEnrollments,
    approveEnrollment,
    advisorApproveEnrollment,
    advisorApproveAll,
    directEnroll,
    getPendingRequests,
    getAdvisorRequests,
    getMyCourses,
    createAnnouncement,
    getAnnouncements,
    uploadMaterial,
    getMaterials,
    getMeetingRequests,
    respondMeeting,
    bulkEnroll,
    uploadGrades
} from "../controllers/faculty.controller.js";
import {
    getMyAvailability,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getFacultySettings
} from "../controllers/availability.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("faculty"));

router.get("/settings", getFacultySettings);
router.post("/grade", submitGrade);
router.post("/upload-grades", uploadGrades);
router.post("/approve-all", approveAllEnrollments);
router.post("/approve-enrollment", approveEnrollment);
router.post("/advisor-approve", advisorApproveEnrollment);
router.post("/advisor-approve-all", advisorApproveAll);
router.post("/direct-enroll", directEnroll);
router.post("/bulk-enroll", bulkEnroll);
router.get("/requests", getPendingRequests);
router.get("/advisor/requests", getAdvisorRequests);

// Courses & Content
router.get("/my-courses", getMyCourses);
router.post("/announcements", createAnnouncement);
router.get("/announcements", getAnnouncements);
router.post("/materials", uploadMaterial);
router.get("/materials", getMaterials);

// Meetings
router.get("/meetings", getMeetingRequests);
router.post("/meetings/respond", respondMeeting);

// Availability Management
router.get("/availability", getMyAvailability);
router.post("/availability", addAvailability);
router.put("/availability/:id", updateAvailability);
router.delete("/availability/:id", deleteAvailability);

export default router;

