import express from "express";
import { registerCompany, getCompany, getCompanyById, updateCompany } from "../controllers/company.controller.js";
import { protect, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";
import singleUpload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", protect, recruiterOrAdminOnly, registerCompany);
router.get("/get", protect, recruiterOrAdminOnly, getCompany);
router.get("/get/:id", protect, getCompanyById);
router.put("/update/:id", protect, recruiterOrAdminOnly, singleUpload, updateCompany);

export default router;
