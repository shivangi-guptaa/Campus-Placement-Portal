import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob } from "@/redux/jobSlice";
import toast from "react-hot-toast";
import CampusEligibilityCard from "./CampusEligibilityCard";
import Navbar from "./shared/Navbar";

const JobDescription = () => {
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  const [eligibilityData, setEligibilityData] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for placement drives");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsApplied(true);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || "Failed to apply";
      toast.error(msg);
    }
  };

  useEffect(() => {
    dispatch(setSingleJob(null));
    if (!jobId || jobId === "undefined") return;

    const fetchSingleJobs = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setEligibilityData(res.data.eligibilityData);

          const currentUserId = user?.id || user?._id;
          const alreadyApplied = Boolean(
            user &&
            currentUserId &&
            res.data.job.applications?.some((app) => {
              const appUserId = app.applicantId || app.applicant?.id || (typeof app.applicant === "number" || typeof app.applicant === "string" ? app.applicant : null);
              return appUserId && String(appUserId) === String(currentUserId);
            })
          );
          setIsApplied(alreadyApplied);
        }
      } catch (error) {
        console.error("Error while fetching single job:", error);
      }
    };
    fetchSingleJobs();
  }, [jobId, dispatch, user?.id, user?._id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto my-8 px-4 bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 dark:text-white">{singleJob?.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="text-blue-700 dark:text-blue-400 font-bold" variant="ghost">
                {singleJob?.positions} Openings
              </Badge>
              <Badge className="text-[#F83002] dark:text-red-400 font-bold" variant="ghost">
                {singleJob?.jobType}
              </Badge>
              <Badge className="text-[#7209B7] dark:text-purple-400 font-bold" variant="ghost">
                {singleJob?.salary} LPA
              </Badge>
            </div>
          </div>
          <Button
            onClick={applyJobHandler}
            disabled={isApplied || (eligibilityData && !eligibilityData.isEligible)}
            className={`rounded-lg font-semibold px-6 ${
              isApplied
                ? "bg-gray-600 cursor-not-allowed text-white"
                : eligibilityData && !eligibilityData.isEligible
                ? "bg-red-500 cursor-not-allowed text-white"
                : "bg-[#7209B7] hover:bg-[#5b0793] text-white"
            }`}
          >
            {isApplied
              ? "Already Applied"
              : eligibilityData && !eligibilityData.isEligible
              ? "Not Eligible"
              : "Apply Now"}
          </Button>
        </div>

        {/* Campus Eligibility & Skill Match Card */}
        {eligibilityData && <CampusEligibilityCard eligibilityData={eligibilityData} />}

        <h1 className="border-b-2 border-b-gray-200 dark:border-b-gray-800 font-bold text-lg py-2 mt-6">
          Placement Drive Details
        </h1>

        <div className="my-4 space-y-2 text-sm text-gray-800 dark:text-gray-200">
          <h1 className="font-bold">
            Company: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.company?.name}</span>
          </h1>
          <h1 className="font-bold">
            Job Type: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.jobType}</span>
          </h1>
          <h1 className="font-bold">
            Location: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.location}</span>
          </h1>
          <h1 className="font-bold">
            Description: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.description}</span>
          </h1>
          <h1 className="font-bold">
            Requirements: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.requirements}</span>
          </h1>
          <h1 className="font-bold">
            Min CGPA Required: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.minCgpa}</span>
          </h1>
          <h1 className="font-bold">
            Package (CTC): <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.salary} LPA</span>
          </h1>
          <h1 className="font-bold">
            Total Applicants: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.applications?.length || 0}</span>
          </h1>
          <h1 className="font-bold">
            Posted Date: <span className="pl-4 font-normal text-gray-700 dark:text-gray-300">{singleJob?.createdAt?.split("T")[0]}</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
