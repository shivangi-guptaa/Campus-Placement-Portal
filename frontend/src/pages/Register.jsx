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
import { Loader2, User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";

const Register = () => {
  const [inputData, setInputData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!inputData.fullName || !inputData.email || !inputData.phoneNumber || !inputData.password || !inputData.role) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, inputData, {
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
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 mt-8">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-4"
        >
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Create Your Account</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Join SkillSync Placement & Internship Portal
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Full Name
            </Label>
            <Input
              type="text"
              value={inputData.fullName}
              name="fullName"
              onChange={changeEventHandler}
              placeholder="e.g. Rahul Sharma"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Email Address
            </Label>
            <Input
              type="email"
              value={inputData.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="e.g. rahul@example.com"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Phone Number
            </Label>
            <Input
              type="text"
              value={inputData.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              placeholder="e.g. 9876543210"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Password
            </Label>
            <Input
              type="password"
              value={inputData.password}
              name="password"
              onChange={changeEventHandler}
              placeholder="••••••••"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              required
            />
          </div>

          <div className="space-y-1 pt-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Select Role
            </Label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-center justify-center p-3 rounded-lg border text-sm font-semibold cursor-pointer transition-all ${
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
                className={`flex items-center justify-center p-3 rounded-lg border text-sm font-semibold cursor-pointer transition-all ${
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

          {loading ? (
            <Button disabled className="w-full bg-[#6A38C2] text-white">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
            </Button>
          ) : (
            <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white font-semibold">
              Register Account
            </Button>
          )}

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                Login here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
