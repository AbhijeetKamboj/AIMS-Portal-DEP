import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createDepartment, listDepartments } from "../controllers/department.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/list", listDepartments);
router.post("/create", requireRole("admin"), createDepartment);

export default router;
