import express from "express";
import { scheduleInterview, submitInterviewFeedback } from "../controllers/interview.controller.js";
import { protect, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/schedule", protect, recruiterOrAdminOnly, scheduleInterview);
router.post("/feedback", protect, recruiterOrAdminOnly, submitInterviewFeedback);

export default router;
