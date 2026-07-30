import express from "express";
import { getTpoAnalytics, getStudentAnalytics } from "../controllers/analytics.controller.js";
import { protect, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/tpo", protect, recruiterOrAdminOnly, getTpoAnalytics);
router.get("/student", protect, getStudentAnalytics);

export default router;
