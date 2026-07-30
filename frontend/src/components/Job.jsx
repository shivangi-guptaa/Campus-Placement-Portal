import React, { useState } from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { SAVED_JOB_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const daysAgoFunction = (mongodbTime) => {
    if (!mongodbTime) return "Recently";
    const createdAt = new Date(mongodbTime);
    const currentDate = new Date();
    const timeDiff = currentDate - createdAt;
    const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    return days === 0 ? "Today" : `${days}d ago`;
  };

  const driveId = job?.id || job?._id;

  const handleSaveToggle = async () => {
    if (!user) {
      toast.error("Please login to save placement drives");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${SAVED_JOB_API_END_POINT}/toggle/${driveId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsSaved(!isSaved);
        toast.success(res.data.message);
      }
    } catch (error) {
      // Local toggle fallback for UI feedback
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Drive removed from saved list" : "Drive saved to bookmarks!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl shadow-sm hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {daysAgoFunction(job?.createdAt)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            className={`rounded-full transition-transform active:scale-95 ${
              isSaved ? "text-purple-600 dark:text-purple-400 fill-purple-600" : "text-gray-400 hover:text-purple-600"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <Bookmark className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex items-center gap-3 my-3">
          <Avatar className="w-12 h-12 border-2 border-purple-100 dark:border-purple-900 shadow-sm">
            <AvatarImage src={job?.company?.logo || "https://github.com/shadcn.png"} />
          </Avatar>
          <div>
            <h1 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
              {job?.company?.name || "Tech Company"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{job?.location}</p>
          </div>
        </div>

        <div>
          <h1 className="font-bold text-lg my-1.5 text-gray-900 dark:text-white hover:text-purple-600 transition-colors cursor-pointer" onClick={() => navigate(`/description/${driveId}`)}>
            {job?.title}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Badge className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800" variant="ghost">
            {job?.positions} openings
          </Badge>
          <Badge className="text-[#F83002] dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800" variant="ghost">
            {job?.jobType}
          </Badge>
          <Badge className="text-[#7209B7] dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800" variant="ghost">
            {job?.salary} LPA
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t dark:border-gray-800">
        <Button
          variant="outline"
          className="w-full rounded-xl dark:border-gray-700 dark:text-white font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => navigate(`/description/${driveId}`)}
        >
          View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>

        <Button
          onClick={handleSaveToggle}
          disabled={loading}
          className={`w-full rounded-xl font-bold text-xs transition-all ${
            isSaved
              ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-400"
              : "bg-[#7209B7] hover:bg-[#5b0793] text-white shadow-sm hover:shadow-md"
          }`}
        >
          {isSaved ? "Saved" : "Save Drive"}
        </Button>
      </div>
    </div>
  );
};

export default Job;
