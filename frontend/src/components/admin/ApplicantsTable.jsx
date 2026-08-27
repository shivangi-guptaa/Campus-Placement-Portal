import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  MoreHorizontal,
  FileText,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Mail,
  Calendar,
  Award,
  Send,
  X,
  Clock,
  Layers,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { APPLICATION_API_END_POINT, ROUND_API_END_POINT, RESULT_API_END_POINT } from "@/utils/constants";

const shortlistingStatuses = [
  { label: "Shortlist Candidate", value: "shortlisted", color: "text-purple-600 dark:text-purple-400 font-bold" },
  { label: "Reject Candidate", value: "rejected", color: "text-red-600 dark:text-red-400 font-bold" },
];

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application);

  // Round Scheduling Modal
  const [scheduleRoundApp, setScheduleRoundApp] = useState(null);
  const [roundForm, setRoundForm] = useState({
    roundName: "Round 2: Technical & Architecture Interview",
    roundType: "TECHNICAL_INTERVIEW",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    meetingLink: "",
    locationDetails: "Google Meet / Campus Placement Cell Hall A",
  });

  // Submit Result (Pending TPO Confirmation) Modal
  const [submitResultApp, setSubmitResultApp] = useState(null);
  const [resultForm, setResultForm] = useState({
    offeredPackage: 14.0,
    offerType: "FTE",
    offerLetterUrl: "",
  });

  const applicationsList = applicants?.applications || applicants || [];

  const statusHandler = async (status, id) => {
    try {
      const res = await axios.patch(
        `${APPLICATION_API_END_POINT}/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  const handleScheduleRound = async (e) => {
    e.preventDefault();
    if (!scheduleRoundApp) return;

    try {
      const res = await axios.post(
        `${ROUND_API_END_POINT}/add`,
        {
          applicationId: scheduleRoundApp.id,
          ...roundForm,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setScheduleRoundApp(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule recruitment round");
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!submitResultApp) return;

    try {
      const res = await axios.post(
        `${RESULT_API_END_POINT}/submit`,
        {
          applicationId: submitResultApp.id,
          offeredPackage: parseFloat(resultForm.offeredPackage),
          offerType: resultForm.offerType,
          offerLetterUrl: resultForm.offerLetterUrl,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setSubmitResultApp(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit candidate result");
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          Candidate Pipeline for Placement Drive
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Candidate Name</TableHead>
            <TableHead className="dark:text-gray-300">CGPA & Branch</TableHead>
            <TableHead className="dark:text-gray-300">Recruitment Status</TableHead>
            <TableHead className="dark:text-gray-300">Resume PDF</TableHead>
            <TableHead className="dark:text-gray-300">Rounds Evaluated</TableHead>
            <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!applicationsList || applicationsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                No student candidates have applied for this drive yet.
              </TableCell>
            </TableRow>
          ) : (
            applicationsList.map((item) => {
              const appId = item?.id || item?._id;
              const student = item?.applicant;
              const resumeUrl = student?.resume || student?.profile?.resume;
              const resumeName = student?.resumeOriginalName || student?.profile?.resumeOriginalName || "View Resume PDF";
              const studentCgpa = student?.cgpa || 8.5;
              const studentBranch = student?.branch || "Computer Science";
              const isEligible = studentCgpa >= (applicants?.minCgpa || 6.0);
              const roundsCount = item?.rounds?.length || 0;

              return (
                <TableRow key={appId} className="dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{student?.fullName || "Student Candidate"}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-purple-600" /> {student?.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> CGPA: {studentCgpa}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400">{studentBranch}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={`text-[10px] font-black uppercase px-2.5 py-0.5 ${
                      item?.finalResult === "OFFERED" || item?.status === "offered"
                        ? "bg-emerald-100 text-emerald-800"
                        : item?.finalResult === "PENDING_TPO_CONFIRMATION"
                        ? "bg-amber-100 text-amber-800"
                        : item?.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {item?.finalResult || item?.status || "APPLIED"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {resumeUrl ? (
                      <a
                        href={resumeUrl.startsWith("http") ? resumeUrl : `http://localhost:8000${resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 w-fit"
                      >
                        <FileText className="w-3.5 h-3.5" /> {resumeName}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No Resume Uploaded</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-600" /> {roundsCount} Round{roundsCount === 1 ? "" : "s"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        onClick={() => {
                          setScheduleRoundApp(item);
                          setRoundForm({
                            roundName: `Round ${roundsCount + 1}: Technical Interview`,
                            roundType: "TECHNICAL_INTERVIEW",
                            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                            meetingLink: "https://meet.google.com/drive-interview",
                            locationDetails: "Virtual Google Meet",
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-[11px] font-bold h-8 dark:border-gray-700"
                      >
                        <Calendar className="w-3 h-3 mr-1" /> Add Round
                      </Button>

                      <Button
                        onClick={() => {
                          setSubmitResultApp(item);
                          setResultForm({
                            offeredPackage: applicants?.salary || 14.0,
                            offerType: applicants?.jobType === "Internship" ? "INTERNSHIP" : "FTE",
                            offerLetterUrl: "",
                          });
                        }}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold h-8"
                      >
                        <Award className="w-3 h-3 mr-1" /> Submit Offer
                      </Button>

                      <Popover>
                        <PopoverTrigger className="p-1.5 rounded-xl border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MoreHorizontal className="w-4 h-4 cursor-pointer text-gray-700 dark:text-gray-300" />
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-2 dark:bg-gray-900 dark:border-gray-800 space-y-1">
                          {shortlistingStatuses.map((st, idx) => (
                            <button
                              key={idx}
                              onClick={() => statusHandler(st.value, appId)}
                              className={`w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${st.color}`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* SCHEDULE ROUND MODAL */}
      {scheduleRoundApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleScheduleRound} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
              <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Schedule Recruitment Round
              </h3>
              <button type="button" onClick={() => setScheduleRoundApp(null)} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">Candidate: <span className="font-bold text-gray-800 dark:text-gray-200">{scheduleRoundApp.applicant?.fullName}</span></p>

            <div className="space-y-3 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div>
                <label className="block mb-1">Round Name</label>
                <input
                  type="text"
                  value={roundForm.roundName}
                  onChange={(e) => setRoundForm({ ...roundForm, roundName: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Round Type</label>
                <select
                  value={roundForm.roundType}
                  onChange={(e) => setRoundForm({ ...roundForm, roundType: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="APTITUDE">Online Aptitude / Assessment</option>
                  <option value="CODING">Live Coding Round</option>
                  <option value="TECHNICAL_INTERVIEW">Technical System Design Interview</option>
                  <option value="HR_INTERVIEW">HR & Behavioral Interview</option>
                  <option value="GROUP_DISCUSSION">Group Discussion</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={roundForm.scheduledAt}
                  onChange={(e) => setRoundForm({ ...roundForm, scheduledAt: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Meeting Link / Platform</label>
                <input
                  type="text"
                  value={roundForm.meetingLink}
                  onChange={(e) => setRoundForm({ ...roundForm, meetingLink: e.target.value })}
                  placeholder="e.g. https://meet.google.com/xyz"
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="button" onClick={() => setScheduleRoundApp(null)} variant="outline" className="rounded-xl font-bold text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs">
                Schedule Round
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SUBMIT FINAL RESULT MODAL (Pending TPO Confirmation) */}
      {submitResultApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitResult} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
              <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Submit Placement Offer
              </h3>
              <button type="button" onClick={() => setSubmitResultApp(null)} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Candidate: <span className="font-bold">{submitResultApp.applicant?.fullName}</span>. Note: Final placement status is officially confirmed by the TPO Office.
            </div>

            <div className="space-y-3 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div>
                <label className="block mb-1">Offered CTC Package (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={resultForm.offeredPackage}
                  onChange={(e) => setResultForm({ ...resultForm, offeredPackage: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Offer Type</label>
                <select
                  value={resultForm.offerType}
                  onChange={(e) => setResultForm({ ...resultForm, offerType: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="FTE">Full-Time Employment (FTE)</option>
                  <option value="PPO">Pre-Placement Offer (PPO)</option>
                  <option value="INTERNSHIP">Internship with Conversion</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="button" onClick={() => setSubmitResultApp(null)} variant="outline" className="rounded-xl font-bold text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs">
                Submit for TPO Confirmation
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApplicantsTable;
