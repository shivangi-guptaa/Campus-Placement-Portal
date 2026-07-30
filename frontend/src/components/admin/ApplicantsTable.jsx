import React from "react";
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
import { MoreHorizontal, FileText, CheckCircle2, XCircle, GraduationCap, Mail, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import toast from "react-hot-toast";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constants";

const shortlistingStatuses = [
  { label: "Shortlist Candidate", value: "shortlisted", color: "text-purple-600 dark:text-purple-400 font-bold" },
  { label: "Schedule Interview", value: "interview_scheduled", color: "text-blue-600 dark:text-blue-400 font-bold" },
  { label: "Release Offer Letter", value: "offered", color: "text-emerald-600 dark:text-emerald-400 font-bold" },
  { label: "Reject Candidate", value: "rejected", color: "text-red-600 dark:text-red-400 font-bold" },
];

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application);

  const statusHandler = async (status, id) => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/update-status/${id}`,
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

  const applicationsList = applicants?.applications || applicants || [];

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          List of student candidates who applied for this placement drive
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Candidate Name</TableHead>
            <TableHead className="dark:text-gray-300">Academic CGPA & Branch</TableHead>
            <TableHead className="dark:text-gray-300">Eligibility Status</TableHead>
            <TableHead className="dark:text-gray-300">Resume PDF</TableHead>
            <TableHead className="dark:text-gray-300">Applied Date</TableHead>
            <TableHead className="text-right dark:text-gray-300">Recruiter Action</TableHead>
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
              const isEligible = studentCgpa >= 6.5;

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
                    {isEligible ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Eligible ({studentCgpa} CGPA)
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold text-xs flex items-center gap-1 w-fit">
                        <XCircle className="w-3.5 h-3.5" /> Below Cutoff
                      </Badge>
                    )}
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

                  <TableCell className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {item?.createdAt ? String(item.createdAt).split("T")[0] : "Recently"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger className="p-1.5 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <MoreHorizontal className="w-4 h-4 cursor-pointer text-gray-700 dark:text-gray-300" />
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 dark:bg-gray-900 dark:border-gray-800 space-y-1">
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicantsTable;
