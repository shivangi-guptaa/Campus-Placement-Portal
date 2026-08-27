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
import { useSelector, useDispatch } from "react-redux";
import { CheckCircle2, Clock, X, ExternalLink, Calendar, Building2, Briefcase, Award, AlertTriangle } from "lucide-react";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";

const AppliedJobsTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const jobsList = allAppliedJobs || [];

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this campus placement application?")) {
      return;
    }
    try {
      setLoadingWithdraw(true);
      const res = await axios.patch(
        `${APPLICATION_API_END_POINT}/${appId}/withdraw`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        if (selectedApp?.id === appId) {
          setSelectedApp({ ...selectedApp, status: "withdrawn" });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to withdraw application");
    } finally {
      setLoadingWithdraw(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      {/* Application Status Portal Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b dark:border-gray-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black text-xl">
                {selectedApp?.job?.company?.name?.[0] || "C"}
              </div>
              <div>
                <h3 className="font-black text-xl text-gray-900 dark:text-white">
                  {selectedApp?.job?.company?.name || "Company information unavailable"}
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                  {selectedApp?.job?.title || "Drive Position"} (₹{selectedApp?.job?.salary || "12"} LPA)
                </p>
              </div>
            </div>

            {/* Application Progress Tracker */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-600" /> Multi-Round Recruitment Pipeline Progress
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
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">2. Campus Eligibility & Policy Clearance</h5>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Passed CGPA, Branch & Institutional Policy Rules
                  </p>
                </div>

                {/* Step 3: Dynamic Rounds or Selection Status */}
                {selectedApp?.rounds && selectedApp.rounds.length > 0 ? (
                  selectedApp.rounds.map((round, idx) => (
                    <div key={round.id || idx} className="relative pl-6">
                      <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${
                        round.status === "PASSED" ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" : round.status === "FAILED" ? "bg-red-500" : "bg-purple-600 ring-4 ring-purple-100 dark:ring-purple-950"
                      }`}>
                        {round.status === "PASSED" ? "✓" : idx + 3}
                      </span>
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white">{round.roundName}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] font-bold ${
                          round.status === "PASSED" ? "bg-emerald-100 text-emerald-800" : round.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {round.status}
                        </Badge>
                        {round.score !== null && (
                          <span className="text-xs font-bold text-purple-600">Score: {round.score}/100</span>
                        )}
                      </div>
                      {round.feedback && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">
                          "{round.feedback}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="relative pl-6">
                    <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${
                      selectedApp?.status === "rejected" || selectedApp?.status === "withdrawn" ? "bg-red-500" : "bg-purple-600"
                    }`}>
                      3
                    </span>
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">3. Selection Status</h5>
                    <div className="mt-1">
                      <Badge
                        className={`font-black px-3 py-1 text-xs uppercase ${
                          selectedApp?.status === "rejected" || selectedApp?.status === "withdrawn"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : selectedApp?.status === "offered"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        }`}
                      >
                        {selectedApp?.status || "UNDER REVIEW"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {selectedApp?.status !== "withdrawn" && selectedApp?.status !== "rejected" && selectedApp?.status !== "offered" && (
                <Button
                  onClick={() => handleWithdraw(selectedApp?.id)}
                  disabled={loadingWithdraw}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 font-bold rounded-xl text-xs"
                >
                  Withdraw Application
                </Button>
              )}
              <Button
                onClick={() => setSelectedApp(null)}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs ${
                  selectedApp?.status === "withdrawn" || selectedApp?.status === "rejected" || selectedApp?.status === "offered" ? "col-span-2" : ""
                }`}
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          Click any row to open multi-round pipeline progress
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Applied Date</TableHead>
            <TableHead className="dark:text-gray-300">Company</TableHead>
            <TableHead className="dark:text-gray-300">Placement Drive</TableHead>
            <TableHead className="dark:text-gray-300">Status</TableHead>
            <TableHead className="text-right dark:text-gray-300">Round Pipeline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400 font-medium">
                You haven't applied to any on-campus placement drive yet.
              </TableCell>
            </TableRow>
          ) : (
            jobsList.map((appliedJob) => (
              <TableRow
                key={appliedJob?.id || appliedJob?._id}
                onClick={() => setSelectedApp(appliedJob)}
                className="dark:border-gray-800 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <TableCell className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                  {appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : "Recently"}
                </TableCell>
                <TableCell className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">
                  {appliedJob?.job?.company?.name || "Company"}
                </TableCell>
                <TableCell className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold">
                  {appliedJob?.job?.title || "Drive Position"}
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                    appliedJob?.status === "offered"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : appliedJob?.status === "withdrawn" || appliedJob?.status === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                  }`}>
                    {appliedJob?.status || "applied"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 hover:underline">
                    View Rounds <ExternalLink className="w-3 h-3" />
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
