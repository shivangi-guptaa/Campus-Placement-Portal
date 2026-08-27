import React, { useEffect, useState } from "react";
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
import { Edit2, Eye, MoreHorizontal, ShieldCheck, Clock, Users, ExternalLink } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allAdminJobs || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (!allAdminJobs) return;
    const filtered = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;
      return (
        job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase())
      );
    });
    setFilterJobs(filtered);
  }, [allAdminJobs, searchJobByText]);

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          Placement Drives & Recruitment Pipeline Status
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Company Name</TableHead>
            <TableHead className="dark:text-gray-300">Drive Role</TableHead>
            <TableHead className="dark:text-gray-300">Drive Type</TableHead>
            <TableHead className="dark:text-gray-300">TPO Approval Status</TableHead>
            <TableHead className="dark:text-gray-300">Package (CTC)</TableHead>
            <TableHead className="text-right dark:text-gray-300">Pipeline Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!filterJobs || filterJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                No placement drives posted yet.
              </TableCell>
            </TableRow>
          ) : (
            filterJobs.map((job) => {
              const jobId = job.id || job._id;
              const isPublished = job.approvalStatus === "PUBLISHED" || job.status === "active";
              const isPending = job.approvalStatus === "PENDING_APPROVAL";
              const isApproved = job.approvalStatus === "APPROVED";
              const isOffCampus = (job.driveType || "ON_CAMPUS").toUpperCase() === "OFF_CAMPUS";
              const applicantsCount = job.applications?.length || 0;

              return (
                <TableRow key={jobId} className="dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-extrabold text-gray-900 dark:text-white">
                    {job?.company?.name || "Company information unavailable"}
                  </TableCell>

                  <TableCell className="text-gray-800 dark:text-gray-200 font-semibold">
                    {job?.title}
                  </TableCell>

                  <TableCell>
                    {isOffCampus ? (
                      <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 text-[10px] font-bold">
                        OFF-CAMPUS
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 text-[10px] font-bold">
                        ON-CAMPUS
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {isPublished ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                        PUBLISHED LIVE
                      </Badge>
                    ) : isApproved ? (
                      <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                        APPROVED (PENDING PUBLISH)
                      </Badge>
                    ) : isPending ? (
                      <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                        PENDING TPO REVIEW
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 text-[10px]">
                        {job.approvalStatus || "DRAFT"}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="font-extrabold text-purple-700 dark:text-purple-300">
                    ₹{job?.salary || 0} LPA
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/jobs/${jobId}/applicants`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
                      >
                        <Users className="w-3.5 h-3.5" /> Pipeline ({applicantsCount})
                      </button>
                    </div>
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

export default AdminJobsTable;
