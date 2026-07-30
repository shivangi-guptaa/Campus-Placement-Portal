import express from "express";
import { toggleSaveJob, getSavedJobs } from "../controllers/savedJob.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/toggle/:id", protect, toggleSaveJob);
router.get("/get", protect, getSavedJobs);

export default router;
