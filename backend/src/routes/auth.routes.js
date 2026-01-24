import express from "express";
import { getMyRole } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
// router.post("/login", login); // Login handled by frontend
router.get("/me/role", authMiddleware, getMyRole);

// Google Calendar OAuth (Unprotected endpoints, handled by query params)
import { initGoogleAuth, googleAuthCallback } from "../controllers/auth.controller.js";
router.get("/google", initGoogleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
