import React, { useEffect, useState } from "react";
import FilterCard from "../components/FilterCard";
import Navbar from "../components/shared/Navbar";
import Job from "../components/Job";
import Footer from "../components/shared/Footer";
import { useSelector, useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { Sparkles, SlidersHorizontal, ShieldCheck, ExternalLink, Award, Search } from "lucide-react";

const Jobs = () => {
  const dispatch = useDispatch();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs || []);
  const [activeTab, setActiveTab] = useState("ON_CAMPUS"); // "ON_CAMPUS" | "OFF_CAMPUS" | "ALL"
  const [activeQuickFilter, setActiveQuickFilter] = useState("All");

  useEffect(() => {
    dispatch(setSearchedQuery(""));
  }, [dispatch]);

  useEffect(() => {
    if (!allJobs) return;

    let filtered = [...allJobs];

    // Filter by On-Campus vs Off-Campus
    if (activeTab === "ON_CAMPUS") {
      filtered = filtered.filter((j) => (j.driveType || "ON_CAMPUS").toUpperCase() === "ON_CAMPUS");
    } else if (activeTab === "OFF_CAMPUS") {
      filtered = filtered.filter((j) => (j.driveType || "").toUpperCase() === "OFF_CAMPUS");
    }

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
  }, [allJobs, searchedQuery, activeTab, activeQuickFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto mt-6 px-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 w-fit border border-purple-400/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Institutional Placement System
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Campus Placement & Internship Drives</h1>
                <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
                  Explore official TPO-approved on-campus placement drives and verified external off-campus opportunities.
                </p>
              </div>

              {/* Drive Type Category Switcher */}
              <div className="flex bg-black/30 p-1.5 rounded-2xl border border-white/10 w-fit">
                <button
                  onClick={() => setActiveTab("ON_CAMPUS")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeTab === "ON_CAMPUS"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> On-Campus Drives
                </button>
                <button
                  onClick={() => setActiveTab("OFF_CAMPUS")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeTab === "OFF_CAMPUS"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Off-Campus
                </button>
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === "ALL"
                      ? "bg-white/20 text-white shadow-md"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  All
                </button>
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
                  Showing <span className="text-purple-600 dark:text-purple-400 font-extrabold">{filterJobs.length}</span>{" "}
                  {activeTab === "ON_CAMPUS" ? "On-Campus Drives" : activeTab === "OFF_CAMPUS" ? "Off-Campus Opportunities" : "Total Opportunities"}
                </span>
              </div>

              {!filterJobs || filterJobs.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-12 rounded-3xl text-center text-gray-500 font-medium shadow-sm">
                  <SlidersHorizontal className="w-10 h-10 mx-auto text-gray-400 mb-3 animate-bounce" />
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200">No Matching Placement Drives Found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try switching to All Drives or clearing filters.</p>
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
