import express from "express";
import { getPolicy, updatePolicy } from "../controllers/policy.controller.js";
import { protect, tpoAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/get", getPolicy);
router.put("/update", protect, tpoAdminOnly, updatePolicy);

export default router;
