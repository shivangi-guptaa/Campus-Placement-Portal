import { Avatar, AvatarImage } from "../components/ui/avatar";
import Navbar from "../components/shared/Navbar";
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Contact, Mail, Pen, FileText, Award, GraduationCap } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl my-6 p-8 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-5">
            <Avatar className="w-20 h-20 border-2 border-purple-200 dark:border-purple-800">
              <AvatarImage src={photoUrl} alt="profile" />
            </Avatar>
            <div>
              <h1 className="font-bold text-2xl text-gray-900 dark:text-white">{user?.fullName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-lg">{userBio}</p>
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
                <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  <GraduationCap className="w-3.5 h-3.5" /> CGPA: {user?.cgpa || 8.0}
                </span>
                <span className="bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  Batch: {user?.batchYear || 2026}
                </span>
                <span className="bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  {user?.branch || "Computer Science"}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setEdit(true)}
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <Pen className="w-4 h-4 mr-1" /> Edit
          </Button>
        </div>

        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t dark:border-gray-800 pt-4">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Contact className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>

        <div className="my-6 border-t dark:border-gray-800 pt-4">
          <h1 className="font-bold text-base text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Skills & Technical Expertise
          </h1>
          <div className="flex flex-wrap gap-2">
            {userSkills && userSkills.length > 0 ? (
              userSkills.map((sk, index) => {
                const sName = typeof sk === "string" ? sk : sk.name;
                return (
                  <Badge key={index} className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold px-3 py-1 text-xs">
                    {sName}
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm text-gray-500">No skills added yet.</span>
            )}
          </div>
        </div>

        <div className="border-t dark:border-gray-800 pt-4 space-y-2">
          <Label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Attached Resume PDF
          </Label>
          {resumeUrl ? (
            <a
              href={resumeUrl.startsWith("http") ? resumeUrl : `http://localhost:8000${resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 dark:text-purple-400 font-semibold text-sm hover:underline flex items-center gap-1"
            >
              📄 {resumeName}
            </a>
          ) : (
            <div className="text-sm text-gray-500">No resume PDF uploaded yet.</div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <h1 className="font-bold text-xl text-gray-900 dark:text-white mb-4">Applied Placement Drives</h1>
        <AppliedJobsTable />
      </div>

      <UpdateProfileDialog edit={edit} setEdit={setEdit} />
    </div>
  );
};

export default Profile;
