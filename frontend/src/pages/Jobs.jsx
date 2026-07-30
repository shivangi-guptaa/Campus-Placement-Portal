import React, { useEffect, useState } from "react";
import FilterCard from "../components/FilterCard";
import Navbar from "../components/shared/Navbar";
import Job from "../components/Job";
import Footer from "../components/shared/Footer";
import { useSelector, useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { Sparkles, SlidersHorizontal, Search } from "lucide-react";

const Jobs = () => {
  const dispatch = useDispatch();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs || []);
  const [activeQuickFilter, setActiveQuickFilter] = useState("All");

  useEffect(() => {
    dispatch(setSearchedQuery(""));
  }, [dispatch]);

  useEffect(() => {
    if (!allJobs) return;

    let filtered = [...allJobs];

    if (activeQuickFilter !== "All") {
      filtered = filtered.filter((job) =>
        job.jobType?.toLowerCase().includes(activeQuickFilter.toLowerCase()) ||
        job.location?.toLowerCase().includes(activeQuickFilter.toLowerCase())
      );
    }

    if (searchedQuery) {
      const q = searchedQuery.toLowerCase();
      filtered = filtered.filter((job) => {
        return (
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.description && job.description.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.salary && String(job.salary).toLowerCase().includes(q))
        );
      });
    }

    setFilterJobs(filtered);
  }, [allJobs, searchedQuery, activeQuickFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto mt-6 px-4">
          {/* Header & Quick Filter Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 w-fit border border-purple-400/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> SkillSync Placement Portal
                </span>
                <h1 className="text-3xl font-black tracking-tight">Active Placement & Internship Drives</h1>
                <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
                  Explore eligible campus drives, view skill match scores, and apply directly to top tech companies.
                </p>
              </div>

              {/* Quick Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {["All", "Full-time", "Internship", "Bangalore", "Hyderabad"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveQuickFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                      activeQuickFilter === filter
                        ? "bg-white text-purple-900 shadow-md scale-105"
                        : "bg-purple-800/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-6 flex-col md:flex-row pb-12">
            {/* Filter Sidebar */}
            <div className="w-full md:w-1/4 shrink-0">
              <FilterCard />
            </div>

            {/* Job Listings Grid */}
            <div className="w-full md:w-3/4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Showing <span className="text-purple-600 dark:text-purple-400">{filterJobs.length}</span> Placement Drives
                </span>
              </div>

              {!filterJobs || filterJobs.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-12 rounded-2xl text-center text-gray-500 font-medium shadow-sm">
                  <SlidersHorizontal className="w-10 h-10 mx-auto text-gray-400 mb-3 animate-bounce" />
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200">No Placement Drives Found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try resetting your filter or searching for another tech skill.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filterJobs.map((job) => (
                    <Job key={job?.id || job?._id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Jobs;
