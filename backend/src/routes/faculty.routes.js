import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    submitGrade,
    approveEnrollment,
    advisorApproveEnrollment,
    directEnroll,
    getPendingRequests,
    getAdvisorRequests
} from "../controllers/faculty.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRole("faculty"));

router.post("/grade", submitGrade);
router.post("/approve-enrollment", approveEnrollment);
router.post("/advisor-approve", advisorApproveEnrollment);
router.post("/direct-enroll", directEnroll);
router.get("/requests", getPendingRequests); // Course Faculty requests
router.get("/advisor/requests", getAdvisorRequests); // Advisor requests

export default router;
