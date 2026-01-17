import express from "express";
import  authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  // req.user already contains id, role, email, name
  res.json(req.user);
});

export default router;
