import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const Job = ({ job }) => {
  const navigate = useNavigate();

  const daysAgoFunction = (mongodbTime) => {
    if (!mongodbTime) return "Recently";
    const createdAt = new Date(mongodbTime);
    const currentDate = new Date();
    const timeDiff = currentDate - createdAt;
    return Math.floor(timeDiff / (24 * 60 * 60 * 1000));
  };

  const driveId = job?.id || job?._id;

  return (
    <div className="p-5 rounded-xl shadow-sm hover:shadow-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {daysAgoFunction(job?.createdAt) === 0 || daysAgoFunction(job?.createdAt) === "Recently"
            ? "Today"
            : daysAgoFunction(job?.createdAt) + " days ago"}
        </p>
        <Button variant="outline" size="icon" className="rounded-full dark:border-gray-700 dark:text-gray-300">
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 my-3">
        <Avatar className="w-10 h-10 border dark:border-gray-700">
          <AvatarImage src={job?.company?.logo || "https://github.com/shadcn.png"} />
        </Avatar>
        <div>
          <h1 className="font-bold text-base text-gray-900 dark:text-white">{job?.company?.name || "Tech Company"}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{job?.location}</p>
        </div>
      </div>

      <div>
        <h1 className="font-bold text-lg my-2 text-gray-900 dark:text-white">{job?.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{job?.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
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

      <div className="flex items-center gap-3 mt-5">
        <Button
          variant="outline"
          className="w-full dark:border-gray-700 dark:text-white font-semibold"
          onClick={() => navigate(`/description/${driveId}`)}
        >
          View Details
        </Button>
        <Button className="w-full bg-[#7209B7] hover:bg-[#5b0793] text-white font-semibold">
          Save Drive
        </Button>
      </div>
    </div>
  );
};

export default Job;
