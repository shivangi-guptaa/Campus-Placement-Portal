import Job from "@/components/Job";
import Navbar from "../components/shared/Navbar";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";

const Browse = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-6 px-4">
        <h1 className="font-extrabold text-2xl my-6 text-gray-900 dark:text-white">
          Browse Placement Drives ({allJobs?.length || 0})
        </h1>
        {!allJobs || allJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-8 rounded-xl text-center text-gray-500 font-medium">
            No Placement Drives Available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allJobs.map((job) => (
              <Job key={job?.id || job?._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
