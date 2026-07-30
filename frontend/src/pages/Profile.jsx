import { Avatar, AvatarImage } from "../components/ui/avatar";
import Navbar from "../components/shared/Navbar";
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import AppliedJobsTable from "../components/AppliedJobsTable";
import UpdateProfileDialog from "../components/UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";

const isResume = true;

const Profile = () => {
  useGetAppliedJobs();
  const [edit, setEdit] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const DEFAULT_PROFILE_PIC = "/icons/defaultProfilePic.png";
  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="size-24">
              <AvatarImage
                src={user?.profile?.profilePhoto || DEFAULT_PROFILE_PIC}
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{user?.fullName}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>
          <Button
            onClick={() => setEdit(true)}
            className="text-right"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>
        <div className="my-5">
          <h1 className="font-medium text-xl">Skills</h1>
          <div className="flex items-center gap-2">
            {user?.profile?.skills.length !== 0 ? (
              user?.profile?.skills.map((item, index) => (
                <Badge key={index}>{item}</Badge>
              ))
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label className="text-md font-bold">Resume</Label>
          {isResume ? (
            <a
              href={user?.profile?.resume}
              target="_blank"
              className="text-blue-500 w-full hover:underline cursor-pointer"
            >
              {user?.profile?.resumeOriginalName}
            </a>
          ) : (
            <div>NA</div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
        <AppliedJobsTable />
      </div>
      <UpdateProfileDialog edit={edit} setEdit={setEdit} />
    </div>
  );
};

export default Profile;
