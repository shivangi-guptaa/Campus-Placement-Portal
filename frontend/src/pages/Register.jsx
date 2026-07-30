import React, { useState } from "react";
import Navbar from "../components/shared/Navbar";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2, User, Mail, Phone, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, Circle, FileText, X } from "lucide-react";

const Register = () => {
  const [inputData, setInputData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "student",
    file: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((store) => store.auth);

  // Password validation rules
  const pwd = inputData.password;
  const passRules = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
  };

  const changeEventHandler = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInputData({ ...inputData, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      toast.error("Please accept the Campus Placement Rules & Code of Conduct to register");
      return;
    }
    if (!passRules.length || !passRules.upper || !passRules.lower || !passRules.number) {
      toast.error("Please ensure your password meets all strength criteria");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", inputData.fullName);
    formData.append("email", inputData.email);
    formData.append("phoneNumber", inputData.phoneNumber);
    formData.append("password", inputData.password);
    formData.append("role", inputData.role);
    if (inputData.file) {
      formData.append("file", inputData.file);
    }

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("Error in Register", error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-xl">
              <ShieldCheck className="w-6 h-6" /> Campus Placement Rules & Code of Conduct
            </div>
            <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-96 overflow-y-auto pr-2">
              <p className="font-bold text-gray-900 dark:text-white">1. One Student, One Job Policy:</p>
              <p>Once a candidate receives a formal job offer (FTE or PPO) with salary &gt;= 8 LPA, they are considered placed and deregistered from subsequent drives.</p>
              
              <p className="font-bold text-gray-900 dark:text-white">2. Mandatory PPT & OA Attendance:</p>
              <p>Candidates registering for a drive must attend the Pre-Placement Talk (PPT) and Online Assessment (OA). Unexcused absence leads to a 30-day drive suspension.</p>
              
              <p className="font-bold text-gray-900 dark:text-white">3. Zero Plagiarism Policy:</p>
              <p>Strict anti-cheating & proctoring protocols during coding tests. Violations result in permanent portal expulsion.</p>
              
              <p className="font-bold text-gray-900 dark:text-white">4. Offer Letter Acceptance:</p>
              <p>Selected candidates must submit their formal acceptance within 7 days of offer release.</p>
            </div>
            <Button onClick={() => setShowRulesModal(false)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
              I Understand & Agree
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 mt-8">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-4"
        >
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Join SkillSync Placement & Internship Portal
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Full Name*
            </Label>
            <Input
              type="text"
              value={inputData.fullName}
              name="fullName"
              onChange={changeEventHandler}
              placeholder="e.g. Rahul Sharma"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Email Address*
            </Label>
            <Input
              type="email"
              value={inputData.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="e.g. rahul@example.com"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Phone Number*
            </Label>
            <Input
              type="text"
              value={inputData.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              placeholder="e.g. 9876543210"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Password*
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={inputData.password}
                name="password"
                onChange={changeEventHandler}
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

          {/* Password Strength Validation Box */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
            <span className="font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider block text-[10px]">
              PASSWORD MUST CONTAIN:
            </span>
            <div className="grid grid-cols-1 gap-1.5 font-medium">
              <div className={`flex items-center gap-2 ${passRules.length ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                {passRules.length ? <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${passRules.upper ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                {passRules.upper ? <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span>One uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 ${passRules.lower ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                {passRules.lower ? <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span>One lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-2 ${passRules.number ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                {passRules.number ? <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" /> : <Circle className="w-4 h-4 text-gray-400" />}
                <span>One number (0-9)</span>
              </div>
            </div>
          </div>

          {/* PDF Resume Uploader Option */}
          {inputData.role === "student" && (
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Upload Resume (PDF Only)
              </Label>
              <Input
                type="file"
                accept="application/pdf,.pdf"
                onChange={changeFileHandler}
                className="dark:bg-gray-800 dark:border-gray-700 text-xs dark:text-white cursor-pointer rounded-xl"
              />
            </div>
          )}

          <div className="space-y-1 pt-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Select Role
            </Label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                  inputData.role === "student"
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={inputData.role === "student"}
                  onChange={changeEventHandler}
                  className="hidden"
                />
                Student
              </label>

              <label
                className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                  inputData.role === "recruiter"
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={inputData.role === "recruiter"}
                  onChange={changeEventHandler}
                  className="hidden"
                />
                Recruiter
              </label>
            </div>
          </div>

          {/* Mandatory Checkbox & Rules Modal Link */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-300">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="font-bold text-purple-600 dark:text-purple-400 underline hover:text-purple-800"
              >
                Campus Placement Rules & Code of Conduct
              </button>
            </label>
          </div>

          {loading ? (
            <Button disabled className="w-full bg-[#6A38C2] text-white rounded-xl">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
            </Button>
          ) : (
            <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white font-semibold rounded-xl">
              Create Account
            </Button>
          )}

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
