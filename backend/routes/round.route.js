import express from "express";
import { addRound, updateRound, getRoundsByApplication } from "../controllers/round.controller.js";
import { protect, recruiterOrAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", protect, recruiterOrAdminOnly, addRound);
router.patch("/:id/update", protect, recruiterOrAdminOnly, updateRound);
router.get("/application/:applicationId", protect, getRoundsByApplication);

export default router;
