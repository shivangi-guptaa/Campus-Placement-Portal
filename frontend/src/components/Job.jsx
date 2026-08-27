import React, { useState } from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck, ArrowRight, ExternalLink, ShieldCheck, GraduationCap, Building2 } from "lucide-react";
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
  const isOffCampus = (job?.driveType || "ON_CAMPUS").toUpperCase() === "OFF_CAMPUS";

  const handleSaveToggle = async () => {
    if (!user) {
      toast.error("Please login to bookmark placement drives");
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
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Drive removed from saved list" : "Drive bookmarked!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl shadow-sm hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top Banner Tag for On-Campus vs Off-Campus */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {isOffCampus ? (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Off-Campus Opportunity
          </span>
        ) : (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" /> TPO On-Campus Drive
          </span>
        )}

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {daysAgoFunction(job?.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            className={`rounded-full h-8 w-8 transition-transform active:scale-95 ${
              isSaved ? "text-purple-600 dark:text-purple-400 fill-purple-600" : "text-gray-400 hover:text-purple-600"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 my-2">
          <Avatar className="w-12 h-12 border-2 border-purple-100 dark:border-purple-900 shadow-sm rounded-2xl">
            <AvatarImage src={job?.company?.logo || "https://github.com/shadcn.png"} />
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
              {job?.company?.name || "Company information unavailable"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{job?.location || "Pan-India"}</p>
          </div>
        </div>

        <div>
          <h2
            className="font-bold text-base my-1 text-gray-900 dark:text-white hover:text-purple-600 transition-colors cursor-pointer line-clamp-1"
            onClick={() => navigate(`/description/${driveId}`)}
          >
            {job?.title}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>

        {/* Academic & CTC Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge className="text-purple-700 dark:text-purple-300 font-extrabold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px]" variant="ghost">
            💰 {job?.salary || job?.ctc} LPA
          </Badge>
          <Badge className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px]" variant="ghost">
            Min CGPA: {job?.minCgpa || 6.0}
          </Badge>
          <Badge className="text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px]" variant="ghost">
            {job?.batchYear || 2026} Batch
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t dark:border-gray-800">
        <Button
          variant="outline"
          className="w-full rounded-xl dark:border-gray-700 dark:text-white font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => navigate(`/description/${driveId}`)}
        >
          View Criteria <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>

        {isOffCampus && job?.externalUrl ? (
          <a
            href={job.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Apply External <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        ) : (
          <Button
            onClick={() => navigate(`/description/${driveId}`)}
            className="w-full rounded-xl font-bold text-xs bg-[#6A38C2] hover:bg-[#582da7] text-white shadow-sm"
          >
            Apply Drive
          </Button>
        )}
      </div>
    </div>
  );
};

export default Job;
