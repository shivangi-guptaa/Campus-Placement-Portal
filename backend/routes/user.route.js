import express from "express";
import { register, login, logout, checkUser, updateProfile, forgotPassword, sendOtp, resetPasswordOtp, verifyRegistrationOtp, resendRegistrationOtp } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { singleUpload, multipleUpload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/verify-registration-otp", verifyRegistrationOtp);
router.post("/resend-registration-otp", resendRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/send-otp", sendOtp);
router.post("/reset-password-otp", resetPasswordOtp);
router.get("/logout", logout);
router.get("/check", protect, checkUser);
router.put(
  "/update-profile",
  protect,
  multipleUpload,
  updateProfile
);

export default router;
