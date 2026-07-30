import express from "express";
import { getRecommendedJobs } from "../controllers/recommendation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/jobs", protect, getRecommendedJobs);

export default router;
