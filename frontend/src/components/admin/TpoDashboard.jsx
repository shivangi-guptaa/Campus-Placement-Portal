import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ANALYTICS_API_END_POINT,
  COMPANY_API_END_POINT,
  JOB_API_END_POINT,
  RESULT_API_END_POINT,
  POLICY_API_END_POINT,
} from "@/utils/constants";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  Award,
  UserCheck,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Send,
  ShieldCheck,
  Settings,
  X,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const TpoDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // TPO Workflow States
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingDrives, setPendingDrives] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);
  const [policy, setPolicy] = useState(null);

  // Modals
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    maxOffersAllowed: 1,
    allowPlacedStudentsToApply: false,
    minCtcIncreasePercentage: 50,
    dreamCompanyMinCtc: 10,
  });

  const [rejectModalData, setRejectModalData] = useState(null); // { type: 'company'|'drive'|'result', id: number, name: string }
  const [rejectionReason, setRejectionReason] = useState("");

  const refreshAllData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, companiesRes, drivesRes, resultsRes, policyRes] = await Promise.all([
        axios.get(`${ANALYTICS_API_END_POINT}/tpo`, { withCredentials: true }),
        axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true }),
        axios.get(`${JOB_API_END_POINT}/get-recruiter-jobs`, { withCredentials: true }),
        axios.get(`${RESULT_API_END_POINT}/all`, { withCredentials: true }),
        axios.get(`${POLICY_API_END_POINT}/get`),
      ]);

      if (analyticsRes.data.success) setData(analyticsRes.data.analytics);

      if (companiesRes.data.success) {
        setPendingCompanies(companiesRes.data.companies.filter((c) => c.status === "PENDING"));
      }

      if (drivesRes.data.success) {
        setPendingDrives(drivesRes.data.jobs.filter((j) => j.approvalStatus === "PENDING_APPROVAL" || j.approvalStatus === "APPROVED"));
      }

      if (resultsRes.data.success) {
        setPendingResults(resultsRes.data.records.filter((r) => r.status === "PENDING_TPO_CONFIRMATION"));
      }

      if (policyRes.data.success && policyRes.data.policy) {
        setPolicy(policyRes.data.policy);
        setPolicyForm({
          maxOffersAllowed: policyRes.data.policy.maxOffersAllowed || 1,
          allowPlacedStudentsToApply: policyRes.data.policy.allowPlacedStudentsToApply || false,
          minCtcIncreasePercentage: policyRes.data.policy.minCtcIncreasePercentage || 50,
          dreamCompanyMinCtc: policyRes.data.policy.dreamCompanyMinCtc || 10,
        });
      }
    } catch (err) {
      console.error("Fetch TPO Dashboard Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Company Approvals
  const handleApproveCompany = async (companyId) => {
    try {
      const res = await axios.patch(`${COMPANY_API_END_POINT}/${companyId}/approve`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve company");
    }
  };

  // Drive Lifecycle (Approve / Publish)
  const handleApproveDrive = async (driveId) => {
    try {
      const res = await axios.patch(`${JOB_API_END_POINT}/${driveId}/approve`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve drive");
    }
  };

  const handlePublishDrive = async (driveId) => {
    try {
      const res = await axios.patch(`${JOB_API_END_POINT}/${driveId}/publish`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish drive");
    }
  };

  // Result Confirmation
  const handleConfirmResult = async (recordId) => {
    try {
      const res = await axios.patch(`${RESULT_API_END_POINT}/${recordId}/confirm`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        refreshAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm result");
    }
  };

  // Generic Rejection Handler
  const handleConfirmRejection = async () => {
    if (!rejectModalData) return;
    try {
      let endpoint = "";
      if (rejectModalData.type === "company") endpoint = `${COMPANY_API_END_POINT}/${rejectModalData.id}/reject`;
      if (rejectModalData.type === "drive") endpoint = `${JOB_API_END_POINT}/${rejectModalData.id}/reject`;
      if (rejectModalData.type === "result") endpoint = `${RESULT_API_END_POINT}/${rejectModalData.id}/reject`;

      const res = await axios.patch(endpoint, { rejectionReason }, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        setRejectModalData(null);
        setRejectionReason("");
        refreshAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject item");
    }
  };

  // Policy Update Handler
  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${POLICY_API_END_POINT}/update`, policyForm, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowPolicyModal(false);
        refreshAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update placement policy");
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center text-gray-500 font-medium">
          Loading Institutional Placement Metrics & Control Panels...
        </div>
      </div>
    );
  }

  const { stats, funnel, topSkills, topCompanyDrives, registeredUsers } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-purple-600" /> TPO Officer Central Control
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Verify Companies, Authorize Placement Drives, Confirm Official Offers & Manage Policies.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPolicyModal(true)}
                variant="outline"
                className="rounded-2xl font-bold text-xs flex items-center gap-1.5 dark:border-gray-700"
              >
                <Settings className="w-4 h-4 text-purple-600" /> Placement Policy Rules
              </Button>
              <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-black px-3.5 py-2 rounded-2xl border border-purple-200 dark:border-purple-800">
                Institutional Portal
              </span>
            </div>
          </div>

          {/* Stats Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Total Companies</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalCompanies || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Placement Drives</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalDrives || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Placed Students</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalPlacedStudents || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Highest Package</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">₹{stats?.highestPackageLpa || 0} LPA</h3>
              </div>
            </div>
          </div>

          {/* SECTION 1: PENDING COMPANY VERIFICATIONS QUEUE */}
          {pendingCompanies.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-300 dark:border-amber-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Pending Company Verification Requests ({pendingCompanies.length})
                </h3>
                <span className="text-xs font-bold bg-amber-200 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCompanies.map((comp) => (
                  <div key={comp.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-black text-base text-gray-900 dark:text-white">{comp.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{comp.description}</p>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-2 space-y-0.5">
                        <p>📍 Location: {comp.location || "Pan-India"}</p>
                        <p>🌐 Website: {comp.website || "N/A"}</p>
                        <p>👤 Recruiter: {comp.owner?.fullName} ({comp.owner?.email})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-800">
                      <Button
                        onClick={() => handleApproveCompany(comp.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Company
                      </Button>
                      <Button
                        onClick={() => setRejectModalData({ type: "company", id: comp.id, name: comp.name })}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: PENDING DRIVE APPROVALS & PUBLISHING QUEUE */}
          {pendingDrives.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-300 dark:border-purple-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Pending Placement Drives for Review ({pendingDrives.length})
                </h3>
                <span className="text-xs font-bold bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full">
                  TPO Approval
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDrives.map((drv) => (
                  <div key={drv.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-base text-gray-900 dark:text-white">{drv.title}</h4>
                        <Badge className="text-[10px] font-bold uppercase">{drv.approvalStatus}</Badge>
                      </div>
                      <p className="text-xs text-purple-600 font-extrabold mt-0.5">₹{drv.salary} LPA | {drv.jobType}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{drv.description}</p>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">
                        <span>Eligibility: Min CGPA {drv.minCgpa} | {drv.branchRequirement} ({drv.batchYear})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-800">
                      {drv.approvalStatus === "PENDING_APPROVAL" && (
                        <Button
                          onClick={() => handleApproveDrive(drv.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}
                      {drv.approvalStatus === "APPROVED" && (
                        <Button
                          onClick={() => handlePublishDrive(drv.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Publish to Students
                        </Button>
                      )}
                      <Button
                        onClick={() => setRejectModalData({ type: "drive", id: drv.id, name: drv.title })}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: PENDING PLACEMENT RESULT CONFIRMATIONS */}
          {pendingResults.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <Award className="w-5 h-5" /> Pending Official Offer Confirmations ({pendingResults.length})
                </h3>
                <span className="text-xs font-bold bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full">
                  Official Confirmation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingResults.map((rec) => (
                  <div key={rec.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-black text-base text-gray-900 dark:text-white">
                        Candidate: {rec.student?.fullName || "Student Candidate"}
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-extrabold">
                        Offered Company: {rec.company?.name || rec.companyName || "Company information unavailable"} | Package: ₹{rec.offeredPackage} LPA ({rec.offerType})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Branch: {rec.student?.branch || "N/A"} | CGPA: {rec.student?.cgpa} ({rec.student?.batchYear})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-800">
                      <Button
                        onClick={() => handleConfirmResult(rec.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm Official Offer
                      </Button>
                      <Button
                        onClick={() => setRejectModalData({ type: "result", id: rec.id, name: `${rec.student?.fullName} (${rec.companyName})` })}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Offer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registered Candidates Directory */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" /> Registered Students & Candidates Directory
              </h3>
              <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                {registeredUsers?.length || 0} Registered Candidates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/80 border-b dark:border-gray-800 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-3">Candidate Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Branch & Batch</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Placement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800">
                  {registeredUsers?.map((usr) => (
                    <tr key={usr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{usr.fullName}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{usr.email}</td>
                      <td className="p-3">
                        <Badge className="capitalize text-[10px] font-bold">{usr.role}</Badge>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {usr.branch || "Computer Science"} ({usr.batchYear || 2026})
                      </td>
                      <td className="p-3 font-bold text-purple-600">{usr.cgpa || "8.0"}</td>
                      <td className="p-3">
                        <Badge className={`text-[10px] font-black uppercase ${
                          usr.placementStatus === "PLACED" || usr.placementStatus === "MULTIPLE_OFFERS"
                            ? "bg-emerald-100 text-emerald-800"
                            : usr.placementStatus === "OPTED_OUT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {usr.placementStatus || "NOT_PLACED"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Reject {rejectModalData.name}
            </h3>
            <p className="text-xs text-gray-500">Please provide a clear official reason for rejection:</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Does not comply with minimum institutional placement criteria."
              className="w-full border rounded-xl p-3 text-sm dark:bg-gray-800 dark:border-gray-700"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setRejectModalData(null)} variant="outline" className="rounded-xl font-bold text-xs">
                Cancel
              </Button>
              <Button onClick={handleConfirmRejection} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs">
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PLACEMENT POLICY CONFIGURATION MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdatePolicy} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
              <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" /> Campus Placement Policy Rules
              </h3>
              <button type="button" onClick={() => setShowPolicyModal(false)} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div>
                <label className="block mb-1">Max Offers Allowed Per Student</label>
                <input
                  type="number"
                  value={policyForm.maxOffersAllowed}
                  onChange={(e) => setPolicyForm({ ...policyForm, maxOffersAllowed: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                  min={1}
                />
              </div>

              <div>
                <label className="block mb-1">Minimum CTC Required for Dream Company Exemption (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={policyForm.dreamCompanyMinCtc}
                  onChange={(e) => setPolicyForm({ ...policyForm, dreamCompanyMinCtc: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1">Minimum % CTC Increment Required for Placed Candidates (%)</label>
                <input
                  type="number"
                  value={policyForm.minCtcIncreasePercentage}
                  onChange={(e) => setPolicyForm({ ...policyForm, minCtcIncreasePercentage: e.target.value })}
                  className="w-full border rounded-xl p-2.5 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allowPlaced"
                  checked={policyForm.allowPlacedStudentsToApply}
                  onChange={(e) => setPolicyForm({ ...policyForm, allowPlacedStudentsToApply: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="allowPlaced" className="cursor-pointer">
                  Allow Placed Candidates to Apply to all Regular Drives
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <Button type="button" onClick={() => setShowPolicyModal(false)} variant="outline" className="rounded-xl font-bold text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs">
                Save Policy Rules
              </Button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TpoDashboard;
