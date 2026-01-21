import express from "express";
import { login } from "../controllers/auth.controller.js";
import { getMyRole } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me/role", authMiddleware, getMyRole);


export default router;
