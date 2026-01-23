import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    enrollCourse,
    getTranscript,
    getCgpa,
    listOfferings,
    getMyEnrollments,
    getSemesterGPA,
    dropCourse,
    requestMeeting,
    getMyMeetingRequests,
    getFacultyList,
    cancelMeeting
} from "../controllers/student.controller.js";
import { getFacultySlots } from "../controllers/availability.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("student"));

router.post("/enroll", enrollCourse);
router.post("/drop-course", dropCourse);
router.get("/transcript", getTranscript);
router.get("/cgpa", getCgpa);
router.get("/offerings", listOfferings);
router.get("/my-enrollments", getMyEnrollments);
router.get("/semester-gpa", getSemesterGPA);
router.get("/faculty-list", getFacultyList);

// Meetings
router.post("/meetings", requestMeeting);
router.get("/meetings", getMyMeetingRequests);
router.post("/meetings/cancel", cancelMeeting);
router.get("/available-slots", getFacultySlots);

export default router;

