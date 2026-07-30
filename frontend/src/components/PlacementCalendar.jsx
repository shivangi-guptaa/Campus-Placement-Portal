import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Award, Users, CheckCircle2, ChevronRight, Video, FileCode, Briefcase } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const calendarEvents = [
  {
    id: 1,
    company: "Google India",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
    role: "Software Development Engineer - I",
    stage: "Online Assessment (OA)",
    date: "Aug 05, 2026",
    time: "10:00 AM - 12:30 PM",
    examType: "2 Hard DSA Coding + 25 CS Fundamentals MCQs (Platform: HackerRank)",
    previousPlaced: "14 NIT Seniors Placed (Avg 24 LPA)",
    minCgpa: "7.5 CGPA",
    branch: "CSE / ECE / EE",
    status: "Upcoming",
  },
  {
    id: 2,
    company: "Microsoft Corporation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    role: "Frontend React Developer (Internship)",
    stage: "Pre-Placement Talk (PPT)",
    date: "Aug 08, 2026",
    time: "02:00 PM - 03:30 PM",
    examType: "PPT & Q/A Session via MS Teams",
    previousPlaced: "22 NIT Seniors Placed (PPO Conversion: 85%)",
    minCgpa: "7.0 CGPA",
    branch: "All Engineering Branches",
    status: "Scheduled",
  },
  {
    id: 3,
    company: "Zomato",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Zomato_logo.png",
    role: "Full Stack Engineer (MERN / MySQL)",
    stage: "Technical Interviews (Round 1 & 2)",
    date: "Aug 12, 2026",
    time: "09:00 AM Onwards",
    examType: "System Design + Live Machine Coding + Behavioral",
    previousPlaced: "9 NIT Seniors Placed (Avg 16 LPA)",
    minCgpa: "6.5 CGPA",
    branch: "CSE / IT / ECE",
    status: "Shortlisted",
  },
  {
    id: 4,
    company: "Amazon Web Services",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    role: "Cloud Infrastructure Engineer",
    stage: "Final Selections & Offer Letters",
    date: "Aug 18, 2026",
    time: "05:00 PM",
    examType: "Bar Raiser Interview + Leadership Principles",
    previousPlaced: "18 NIT Seniors Placed (Avg 28.5 LPA)",
    minCgpa: "7.5 CGPA",
    branch: "CSE / ECE / ME",
    status: "Upcoming",
  },
];

const PlacementCalendar = () => {
  const [activeStage, setActiveStage] = useState("All");

  const filteredEvents = activeStage === "All"
    ? calendarEvents
    : calendarEvents.filter((ev) => ev.stage.toLowerCase().includes(activeStage.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Upcoming Placement Calendar & Timelines
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Live schedule for Pre-Placement Talks (PPT), Online Assessments (OA), Technical Interviews & Senior Placement Stats
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
            {["All", "PPT", "OA", "Interviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveStage(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === tab
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                {tab === "PPT" ? "📢 Pre-Placement" : tab === "OA" ? "📝 Online Assessment" : tab === "Interviews" ? "💻 Interviews" : "🌟 All Events"}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={ev.logo} alt={ev.company} className="w-8 h-8 object-contain" />
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{ev.company}</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{ev.role}</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-bold text-xs">
                  {ev.stage}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span>{ev.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>{ev.time}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <FileCode className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Exam / Evaluation Pattern:</span>
                    <p className="text-gray-600 dark:text-gray-400">{ev.examType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 border-t dark:border-gray-800">
                  <Award className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Previous NIT Seniors Placed:</span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">{ev.previousPlaced}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded font-medium">
                    Min {ev.minCgpa}
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded font-medium">
                    {ev.branch}
                  </span>
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center hover:underline cursor-pointer">
                  View Timeline <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementCalendar;
