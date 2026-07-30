import express from "express";
import { postJob, getAllJobs, getJobById, getRecruiterJobs } from "../controllers/job.controller.js";
import { protect, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/post", protect, recruiterOrAdminOnly, postJob);
router.get("/get", getAllJobs);
router.get("/get/:id", getJobById); // Public endpoint so guests can view drive details
router.get("/get-recruiter-jobs", protect, recruiterOrAdminOnly, getRecruiterJobs);

export default router;
