import express from "express";
import { register, login, logout, checkUser, updateProfile, forgotPassword } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { singleUpload, multipleUpload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/logout", protect, logout);
router.get("/check", protect, checkUser);
router.put(
  "/update-profile",
  protect,
  multipleUpload,
  updateProfile
);

export default router;
