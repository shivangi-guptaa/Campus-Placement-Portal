import React, { useState } from "react";
import Navbar from "../components/shared/Navbar";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constants";
import { Loader2, Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, ShieldCheck, Send } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Step 1: Request 6-digit Verification OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_END_POINT}/send-otp`, { email });

      if (res.data.success) {
        toast.success(res.data.message || `6-Digit OTP sent to ${email}!`);
        if (res.data.demoOtp) {
          setDemoOtp(res.data.demoOtp);
          setOtp(res.data.demoOtp);
        } else {
          setOtp("");
        }
        setStep(2);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPasswordWithOtp = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please enter the 6-digit OTP and new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_END_POINT}/reset-password-otp`, {
        email,
        otp,
        newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid OTP or Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 mt-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/login" className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Back to Sign In</span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              {step === 1 ? "Reset Password via OTP" : "Verify OTP & Set Password"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {step === 1
                ? "Enter your registered email to receive a 6-digit OTP"
                : `Enter the 6-digit OTP sent to ${email}`}
            </p>
            {step === 2 && demoOtp && (
              <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold text-center">
                Demo Mode Code: <span className="text-sm font-mono tracking-widest text-emerald-900 dark:text-emerald-200">{demoOtp}</span> (Auto-filled)
              </div>
            )}
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Registered Email Address*
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@demo.com"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl"
                  required
                />
              </div>

              {loading ? (
                <Button disabled className="w-full bg-[#6A38C2] text-white rounded-xl">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending 6-Digit OTP...
                </Button>
              ) : (
                <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Verification OTP
                </Button>
              )}
            </form>
          ) : (
            <form onSubmit={handleResetPasswordWithOtp} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Enter 6-Digit OTP Code*
                </Label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono tracking-widest text-center text-lg font-bold rounded-xl border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> New Password*
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Confirm New Password*
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-purple-600 underline font-semibold"
                >
                  Resend OTP / Change Email
                </button>
              </div>

              {loading ? (
                <Button disabled className="w-full bg-[#6A38C2] text-white rounded-xl">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying OTP & Resetting...
                </Button>
              ) : (
                <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white font-bold rounded-xl">
                  Verify OTP & Set New Password
                </Button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
