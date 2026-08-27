import express from "express";
import {
  registerCompany,
  getCompany,
  getCompanyById,
  updateCompany,
  approveCompany,
  rejectCompany,
  suspendCompany,
  getPendingCompanies,
} from "../controllers/company.controller.js";
import { protect, recruiterOrAdminOnly, tpoAdminOnly } from "../middlewares/auth.middleware.js";
import singleUpload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", protect, recruiterOrAdminOnly, registerCompany);
router.get("/get", protect, recruiterOrAdminOnly, getCompany);
router.get("/pending", protect, tpoAdminOnly, getPendingCompanies);
router.get("/get/:id", protect, getCompanyById);
router.put("/update/:id", protect, recruiterOrAdminOnly, singleUpload, updateCompany);

// TPO Company Verification & Lifecycle Routes
router.patch("/:id/approve", protect, tpoAdminOnly, approveCompany);
router.patch("/:id/reject", protect, tpoAdminOnly, rejectCompany);
router.patch("/:id/suspend", protect, tpoAdminOnly, suspendCompany);

export default router;
