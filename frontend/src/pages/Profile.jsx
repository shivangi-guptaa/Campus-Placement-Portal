import { Avatar, AvatarImage } from "../components/ui/avatar";
import Navbar from "../components/shared/Navbar";
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Contact, Mail, Pen, FileText, Award, GraduationCap, ShieldCheck, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import AppliedJobsTable from "../components/AppliedJobsTable";
import UpdateProfileDialog from "../components/UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";

const Profile = () => {
  useGetAppliedJobs();
  const [edit, setEdit] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const DEFAULT_PROFILE_PIC = "https://github.com/shadcn.png";

  const photoUrl = user?.profilePhoto || user?.profile?.profilePhoto || DEFAULT_PROFILE_PIC;
  const userBio = user?.bio || user?.profile?.bio || "No bio provided yet.";
  const userSkills = user?.skills || user?.profile?.skills || [];
  const resumeUrl = user?.resume || user?.profile?.resume;
  const resumeName = user?.resumeOriginalName || user?.profile?.resumeOriginalName || "View Uploaded Resume";

  const placementStatus = user?.placementStatus || "NOT_PLACED";
  const isPlaced = placementStatus === "PLACED" || placementStatus === "MULTIPLE_OFFERS";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-6 mt-6 px-4">
        {/* Institutional Placement Status Banner */}
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isPlaced
            ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300 dark:border-emerald-800"
            : placementStatus === "OPTED_OUT"
            ? "bg-amber-500/10 border-amber-300 dark:border-amber-800"
            : "bg-purple-500/10 border-purple-200 dark:border-purple-800"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
              isPlaced ? "bg-emerald-500 text-white" : placementStatus === "OPTED_OUT" ? "bg-amber-500 text-white" : "bg-purple-600 text-white"
            }`}>
              {isPlaced ? "🎉" : placementStatus === "OPTED_OUT" ? "⏸️" : "🎓"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Campus Placement Status:
                </span>
                <Badge className={`font-black text-xs px-3 py-0.5 rounded-full ${
                  isPlaced
                    ? "bg-emerald-600 text-white"
                    : placementStatus === "OPTED_OUT"
                    ? "bg-amber-600 text-white"
                    : "bg-purple-600 text-white"
                }`}>
                  {placementStatus}
                </Badge>
              </div>

              {isPlaced ? (
                <div className="mt-1">
                  <h3 className="font-extrabold text-lg text-emerald-800 dark:text-emerald-300">
                    Placed at {user?.placedCompanyName || "Company information unavailable"}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    Official Package: {user?.currentPackage || 18} LPA | Upgradable for Dream Offers (≥ 10 LPA / +50% CTC)
                  </p>
                </div>
              ) : placementStatus === "OPTED_OUT" ? (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                  You have opted out of active campus placement drives (Higher Studies / Competitive Exams).
                </p>
              ) : (
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
                  Active & Eligible for all matching On-Campus Placement & Internship Drives.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20 border-2 border-purple-200 dark:border-purple-800 rounded-3xl">
                <AvatarImage src={photoUrl} alt="profile" />
              </Avatar>
              <div>
                <h1 className="font-black text-2xl text-gray-900 dark:text-white">{user?.fullName}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 max-w-lg">{userBio}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                    <GraduationCap className="w-3.5 h-3.5" /> CGPA: {user?.cgpa || "8.5"}
                  </span>
                  <span className="bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                    Batch: {user?.batchYear || 2026}
                  </span>
                  <span className="bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                    {user?.branch || "Computer Science"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setEdit(true)}
              variant="outline"
              className="dark:border-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs"
            >
              <Pen className="w-3.5 h-3.5 mr-1" /> Edit Profile
            </Button>
          </div>

          <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t dark:border-gray-800 pt-4">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
              <Contact className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{user?.phoneNumber}</span>
            </div>
          </div>

          <div className="my-6 border-t dark:border-gray-800 pt-4">
            <h2 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Technical Skills & Match Profile
            </h2>
            <div className="flex flex-wrap gap-2">
              {userSkills && userSkills.length > 0 ? (
                userSkills.map((sk, index) => {
                  const sName = typeof sk === "string" ? sk : sk.name;
                  return (
                    <Badge key={index} className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold px-3 py-1 text-xs rounded-xl">
                      {sName}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-xs text-gray-500">No skills attached yet.</span>
              )}
            </div>
          </div>

          <div className="border-t dark:border-gray-800 pt-4 space-y-2">
            <Label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Verified PDF Resume
            </Label>
            {resumeUrl ? (
              <a
                href={resumeUrl.startsWith("http") ? resumeUrl : `http://localhost:8000${resumeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 dark:text-purple-400 font-bold text-sm hover:underline flex items-center gap-1"
              >
                📄 {resumeName}
              </a>
            ) : (
              <div className="text-xs text-gray-500">No PDF resume uploaded yet. Click edit to upload.</div>
            )}
          </div>
        </div>

        {/* Applied Drives Section */}
        <div>
          <h2 className="font-black text-xl text-gray-900 dark:text-white mb-3">Applied Campus Placement Drives</h2>
          <AppliedJobsTable />
        </div>
      </div>

      <UpdateProfileDialog edit={edit} setEdit={setEdit} />
    </div>
  );
};

export default Profile;
