import React from "react";
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
import { useSelector } from "react-redux";

const AppliedJobsTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const jobsList = allAppliedJobs || [];

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          List of your applied campus placement & internship drives
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Applied Date</TableHead>
            <TableHead className="dark:text-gray-300">Company</TableHead>
            <TableHead className="dark:text-gray-300">Drive Title</TableHead>
            <TableHead className="text-right dark:text-gray-300">Status</TableHead>
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
              <TableRow key={appliedJob?.id || appliedJob?._id} className="dark:border-gray-800">
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
                  <Badge
                    className={`font-bold px-3 py-1 text-xs ${
                      appliedJob?.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : appliedJob?.status === "pending"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        : appliedJob?.status === "offered"
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    }`}
                  >
                    {(appliedJob?.status || "pending").toUpperCase().replace("_", " ")}
                  </Badge>
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
