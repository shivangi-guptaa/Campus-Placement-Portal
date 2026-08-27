import express from "express";
import {
  applyJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
  withdrawApplication,
} from "../controllers/application.controller.js";
import { protect, studentOnly, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply endpoints
router.post("/apply/:id", protect, studentOnly, applyJob);
router.post("/:id/apply", protect, studentOnly, applyJob);

// View endpoints
router.get("/get", protect, studentOnly, getAppliedJobs);
router.get("/me", protect, studentOnly, getAppliedJobs);
router.get("/:id/applicants", protect, recruiterOrAdminOnly, getApplicants);

// Status & Withdrawal
router.patch("/:id/withdraw", protect, studentOnly, withdrawApplication);
router.patch("/status/:id/update", protect, recruiterOrAdminOnly, updateStatus);
router.patch("/:id/status", protect, recruiterOrAdminOnly, updateStatus);

export default router;
