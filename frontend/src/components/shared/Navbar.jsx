import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2, BarChart3, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constants";
import { setUser } from "@/redux/authSlice";
import { useTheme } from "../ThemeProvider";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const DEFAULT_PROFILE_PIC = "https://github.com/shadcn.png";

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
        <div>
          <Link to="/">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Skill<span className="text-[#6A38C2]">Sync</span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                TPO Portal
              </span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <ul className="flex font-medium items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <Link to="/" className="hover:text-purple-600 font-medium">Home</Link>
            </li>

            {user && (user.role === "recruiter" || user.role === "tpo_admin") ? (
              <>
                <li>
                  <Link to="/admin/tpo" className="hover:text-purple-600 font-semibold flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <BarChart3 className="w-4 h-4" /> TPO Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/admin/companies" className="hover:text-purple-600">Companies</Link>
                </li>
                <li>
                  <Link to="/admin/jobs" className="hover:text-purple-600">Recruiter Drives</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/jobs" className="hover:text-purple-600">Placement Drives</Link>
                </li>
                <li>
                  <Link to="/browse" className="hover:text-purple-600">Browse Companies</Link>
                </li>
              </>
            )}
          </ul>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Toggle Dark / Light Mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="dark:border-gray-700 dark:text-gray-200">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#6A38C2] hover:bg-[#5B30A6]">
                  Register
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-purple-200 dark:border-purple-800">
                  <AvatarImage
                    src={user?.profilePhoto || user?.profile?.profilePhoto || DEFAULT_PROFILE_PIC}
                    alt="profile-photo"
                  />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 dark:bg-gray-900 dark:border-gray-800">
                <div>
                  <div className="flex gap-3 items-center border-b dark:border-gray-800 pb-3">
                    <Avatar className="cursor-pointer border dark:border-gray-700">
                      <AvatarImage
                        src={user?.profilePhoto || user?.profile?.profilePhoto || DEFAULT_PROFILE_PIC}
                        alt="profile-photo"
                      />
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{user?.fullName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                        Role: {user?.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <User2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>View Profile</span>
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
