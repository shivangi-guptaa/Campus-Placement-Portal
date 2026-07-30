import React, { useEffect, useState } from "react";
import FilterCard from "../components/FilterCard";
import Navbar from "../components/shared/Navbar";
import Job from "../components/Job";
import { useSelector, useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";

const Jobs = () => {
  const dispatch = useDispatch();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs || []);

  useEffect(() => {
    dispatch(setSearchedQuery(""));
  }, [dispatch]);

  useEffect(() => {
    if (!allJobs) return;
    if (searchedQuery) {
      const q = searchedQuery.toLowerCase();
      const filtered = allJobs.filter((job) => {
        return (
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.description && job.description.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.salary && String(job.salary).toLowerCase().includes(q))
        );
      });
      setFilterJobs(filtered);
    } else {
      setFilterJobs(allJobs);
    }
  }, [allJobs, searchedQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-10">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-6 px-4">
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Filter Sidebar */}
          <div className="w-full md:w-1/4">
            <FilterCard />
          </div>

          {/* Job Listings */}
          <div className="w-full md:w-3/4">
            {!filterJobs || filterJobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-8 rounded-xl text-center text-gray-500 font-medium">
                No Placement Drives Found Matching Filter
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                {filterJobs.map((job) => (
                  <Job key={job?.id || job?._id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
