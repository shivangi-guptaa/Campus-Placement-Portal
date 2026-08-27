import express from "express";
import {
  postJob,
  getAllJobs,
  getEligibleJobs,
  getJobById,
  getRecruiterJobs,
  approveDrive,
  rejectDrive,
  publishDrive,
  closeDrive,
} from "../controllers/job.controller.js";
import { protect, studentOnly, recruiterOrAdminOnly, tpoAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Drive Listing & Details
router.get("/get", getAllJobs);
router.get("/eligible", protect, studentOnly, getEligibleJobs);
router.get("/get/:id", getJobById);
router.get("/get-recruiter-jobs", protect, recruiterOrAdminOnly, getRecruiterJobs);

// Drive Creation
router.post("/post", protect, recruiterOrAdminOnly, postJob);

// TPO Drive Approval & Lifecycle Routes
router.patch("/:id/approve", protect, tpoAdminOnly, approveDrive);
router.patch("/:id/reject", protect, tpoAdminOnly, rejectDrive);
router.patch("/:id/publish", protect, tpoAdminOnly, publishDrive);
router.patch("/:id/close", protect, recruiterOrAdminOnly, closeDrive);

export default router;
