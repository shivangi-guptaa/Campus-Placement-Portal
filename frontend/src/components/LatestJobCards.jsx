import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();
  const driveId = job?.id || job?._id;

  return (
    <div
      onClick={() => navigate(`/description/${driveId}`)}
      className="p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 cursor-pointer w-full max-w-md mx-auto transition-all text-gray-900 dark:text-white"
    >
      <div className="mb-2">
        <h1 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
          {job?.company?.name}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{job?.location}</p>
      </div>
      <div className="mb-3">
        <h1 className="font-bold text-base sm:text-lg my-1 text-gray-900 dark:text-white">{job?.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{job?.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Badge className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50" variant="ghost">
          {job?.positions} openings
        </Badge>
        <Badge className="text-[#F83002] dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/50" variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className="text-[#7209B7] dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/50" variant="ghost">
          {job?.salary} LPA
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
