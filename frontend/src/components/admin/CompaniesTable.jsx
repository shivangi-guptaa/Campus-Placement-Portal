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
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal, ShieldCheck, Clock, XCircle, Building2, CheckCircle, Ban, AlertTriangle, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector((store) => store.company);
  const { user } = useSelector((store) => store.auth);
  const [filterCompany, setFilterCompany] = useState(companies || []);
  const [localCompanies, setLocalCompanies] = useState(companies || []);
  const navigate = useNavigate();
  const isTpo = user?.role === "tpo_admin";

  // Reject/Suspend modal
  const [rejectModal, setRejectModal] = useState(null); // { companyId, companyName, action: 'reject'|'suspend' }
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    setLocalCompanies(companies || []);
  }, [companies]);

  useEffect(() => {
    const filtered = localCompanies.filter((company) => {
      if (!searchCompanyByText) return true;
      return company.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
    });
    setFilterCompany(filtered);
  }, [localCompanies, searchCompanyByText]);

  const updateLocalStatus = (companyId, newStatus) => {
    setLocalCompanies((prev) =>
      prev.map((c) =>
        (c.id || c._id) === companyId
          ? { ...c, status: newStatus, isApproved: newStatus === "APPROVED" }
          : c
      )
    );
  };

  const handleApprove = async (companyId) => {
    setActionLoading(companyId + "_approve");
    try {
      const res = await axios.patch(
        `${COMPANY_API_END_POINT}/${companyId}/approve`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        updateLocalStatus(companyId, "APPROVED");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve company");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmRejectOrSuspend = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.companyId + "_" + rejectModal.action);
    try {
      const endpoint =
        rejectModal.action === "suspend"
          ? `${COMPANY_API_END_POINT}/${rejectModal.companyId}/suspend`
          : `${COMPANY_API_END_POINT}/${rejectModal.companyId}/reject`;
      const body =
        rejectModal.action === "suspend"
          ? { reason: rejectReason || "Suspended by TPO Office." }
          : { rejectionReason: rejectReason || "Does not meet placement criteria." };

      const res = await axios.patch(endpoint, body, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        updateLocalStatus(rejectModal.companyId, rejectModal.action === "suspend" ? "SUSPENDED" : "REJECTED");
        setRejectModal(null);
        setRejectReason("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
        <Table>
          <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
            Partner Companies &amp; Institutional Verification Status
          </TableCaption>
          <TableHeader>
            <TableRow className="dark:border-gray-800">
              <TableHead className="dark:text-gray-300">Company Logo</TableHead>
              <TableHead className="dark:text-gray-300">Company Name</TableHead>
              <TableHead className="dark:text-gray-300">TPO Verification Status</TableHead>
              <TableHead className="dark:text-gray-300">Location</TableHead>
              <TableHead className="dark:text-gray-300">Created Date</TableHead>
              <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filterCompany || filterCompany.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                  No registered companies found.
                </TableCell>
              </TableRow>
            ) : (
              filterCompany.map((company) => {
                const compId = company.id || company._id;
                const isApproved = company.status === "APPROVED" || company.isApproved;
                const isPending = company.status === "PENDING";
                const isRejected = company.status === "REJECTED";
                const isSuspended = company.status === "SUSPENDED";

                return (
                  <TableRow key={compId} className="dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <Avatar className="w-10 h-10 border rounded-2xl">
                        <AvatarImage src={company.logo || "https://github.com/shadcn.png"} />
                      </Avatar>
                    </TableCell>

                    <TableCell className="font-bold text-gray-900 dark:text-white">
                      {company.name}
                    </TableCell>

                    <TableCell>
                      {isApproved ? (
                        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3.5 h-3.5" /> APPROVED
                        </Badge>
                      ) : isPending ? (
                        <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                          <Clock className="w-3.5 h-3.5" /> PENDING VERIFICATION
                        </Badge>
                      ) : isRejected ? (
                        <Badge className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                          <XCircle className="w-3.5 h-3.5" /> REJECTED
                        </Badge>
                      ) : isSuspended ? (
                        <Badge className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                          <Ban className="w-3.5 h-3.5" /> SUSPENDED
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 font-bold text-xs">
                          {company.status || "UNVERIFIED"}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                      {company.location || "Pan-India"}
                    </TableCell>

                    <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                      {company.createdAt ? String(company.createdAt).split("T")[0] : "Recently"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Popover>
                        <PopoverTrigger className="p-1.5 rounded-xl border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MoreHorizontal className="w-4 h-4 cursor-pointer text-gray-700 dark:text-gray-300" />
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-2 dark:bg-gray-900 dark:border-gray-800 space-y-1">

                          {/* TPO-only: Approve (shown for PENDING, REJECTED, SUSPENDED) */}
                          {isTpo && (isPending || isRejected || isSuspended) && (
                            <button
                              onClick={() => handleApprove(compId)}
                              disabled={actionLoading === compId + "_approve"}
                              className="flex items-center gap-2 w-full text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* TPO-only: Reject (shown for PENDING or APPROVED) */}
                          {isTpo && (isPending || isApproved) && (
                            <button
                              onClick={() => setRejectModal({ companyId: compId, companyName: company.name, action: "reject" })}
                              className="flex items-center gap-2 w-full text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          {/* TPO-only: Suspend (only for APPROVED) */}
                          {isTpo && isApproved && (
                            <button
                              onClick={() => setRejectModal({ companyId: compId, companyName: company.name, action: "suspend" })}
                              className="flex items-center gap-2 w-full text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Edit — always visible */}
                          <button
                            onClick={() => navigate(`/admin/companies/${compId}`)}
                            className="flex items-center gap-2 w-full text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-600 dark:text-purple-400"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Profile</span>
                          </button>

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

      {/* Reject / Suspend Reason Modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setRejectModal(null); setRejectReason(""); }}
        >
          <div
            className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setRejectModal(null); setRejectReason(""); }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2 pr-8">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {rejectModal.action === "suspend" ? "Suspend" : "Reject"}: {rejectModal.companyName}
            </h3>

            <p className="text-xs text-gray-500">Please provide a reason:</p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={
                rejectModal.action === "suspend"
                  ? "e.g. Violation of campus placement norms."
                  : "e.g. Does not meet campus placement verification criteria."
              }
              className="w-full border rounded-xl p-3 text-sm dark:bg-gray-800 dark:border-gray-700"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="border rounded-xl py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectOrSuspend}
                disabled={!!actionLoading}
                className={`rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50 ${
                  rejectModal.action === "suspend"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {rejectModal.action === "suspend" ? "Confirm Suspend" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompaniesTable;
