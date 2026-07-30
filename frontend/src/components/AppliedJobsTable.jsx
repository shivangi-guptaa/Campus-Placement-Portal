import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import { CheckCircle2, Clock, X, ExternalLink, Calendar, Building2, Briefcase, Award } from "lucide-react";

const AppliedJobsTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const [selectedApp, setSelectedApp] = useState(null);
  const jobsList = allAppliedJobs || [];

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      {/* Application Status Portal Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b dark:border-gray-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black text-xl">
                {selectedApp?.job?.company?.name?.[0] || "C"}
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">
                  {selectedApp?.job?.company?.name || "Company"}
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                  {selectedApp?.job?.title || "Drive Position"} ({selectedApp?.job?.salary || "12"} LPA)
                </p>
              </div>
            </div>

            {/* Application Progress Tracker */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-600" /> Candidate Application Progress Portal
              </h4>

              <div className="relative border-l-2 border-purple-200 dark:border-purple-900 ml-4 space-y-5">
                {/* Step 1 */}
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </span>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">1. Application Submitted</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Submitted on {selectedApp?.createdAt ? selectedApp.createdAt.split("T")[0] : "Recently"}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </span>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">2. Campus Eligibility Check</h5>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Passed CGPA & Skill Criteria Checklist
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative pl-6">
                  <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${
                    selectedApp?.status === "rejected" ? "bg-red-500" : "bg-purple-600"
                  }`}>
                    3
                  </span>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">3. Selection Status</h5>
                  <div className="mt-1">
                    <Badge
                      className={`font-bold px-3 py-1 text-xs uppercase ${
                        selectedApp?.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : selectedApp?.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : selectedApp?.status === "offered"
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                      }`}
                    >
                      {selectedApp?.status || "PENDING UNDER REVIEW"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => setSelectedApp(null)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
              Close Portal View
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          Click any row to open candidate status portal timeline
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Applied Date</TableHead>
            <TableHead className="dark:text-gray-300">Company</TableHead>
            <TableHead className="dark:text-gray-300">Drive Title</TableHead>
            <TableHead className="text-right dark:text-gray-300">Status Portal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400 font-medium">
                You haven't applied to any placement drive yet.
              </TableCell>
            </TableRow>
          ) : (
            jobsList.map((appliedJob) => (
              <TableRow
                key={appliedJob?.id || appliedJob?._id}
                onClick={() => setSelectedApp(appliedJob)}
                className="dark:border-gray-800 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <TableCell className="text-gray-700 dark:text-gray-300 font-medium">
                  {appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : "Recently"}
                </TableCell>
                <TableCell className="font-bold text-gray-900 dark:text-white">
                  {appliedJob?.job?.company?.name || "Company"}
                </TableCell>
                <TableCell className="text-gray-800 dark:text-gray-200">
                  {appliedJob?.job?.title || "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 hover:underline">
                    View Portal <ExternalLink className="w-3 h-3" />
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobsTable;
