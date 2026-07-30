import express from "express";
import { applyJob, getAppliedJobs, getApplicants, updateStatus } from "../controllers/application.controller.js";
import { protect, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/apply/:id", protect, applyJob);
router.get("/get", protect, getAppliedJobs);
router.get("/:id/applicants", protect, recruiterOrAdminOnly, getApplicants);
router.post("/update-status/:id", protect, recruiterOrAdminOnly, updateStatus);

export default router;
