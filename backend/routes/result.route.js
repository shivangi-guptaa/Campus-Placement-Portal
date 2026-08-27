import express from "express";
import { submitResult, confirmResult, rejectResult, getResults } from "../controllers/result.controller.js";
import { protect, recruiterOrAdminOnly, tpoAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", protect, recruiterOrAdminOnly, submitResult);
router.patch("/:id/confirm", protect, tpoAdminOnly, confirmResult);
router.patch("/:id/reject", protect, tpoAdminOnly, rejectResult);
router.get("/get", protect, getResults);
router.get("/all", protect, getResults);

export default router;
