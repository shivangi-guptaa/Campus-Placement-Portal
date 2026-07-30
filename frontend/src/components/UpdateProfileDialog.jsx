import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { USER_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";
import axios from "axios";
import { setUser } from "@/redux/authSlice";

const UpdateProfileDialog = ({ edit, setEdit }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const userSkillsStr = Array.isArray(user?.skills)
    ? user.skills.map((s) => (typeof s === "string" ? s : s.name)).join(", ")
    : user?.profile?.skills?.join(", ") || "";

  const [input, setInput] = useState({
    bio: user?.bio || user?.profile?.bio || "",
    skills: userSkillsStr,
    file: null,
    profilePhoto: null,
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  const changePhotoHandler = (e) => {
    const photo = e.target.files?.[0];
    setInput({ ...input, profilePhoto: photo });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    if (input.file) {
      formData.append("file", input.file);
    }
    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${USER_API_END_POINT}/update-profile`,
        formData,
        {
          headers: {
            "Content-type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setEdit(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={edit} onOpenChange={setEdit}>
      <DialogContent
        className="flex flex-col gap-5 sm:w-[450px] dark:bg-gray-900 dark:border-gray-800 dark:text-white rounded-3xl"
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-xl text-gray-900 dark:text-white">
            Update Profile Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Bio</Label>
            <Input
              id="bio"
              name="bio"
              type="text"
              value={input.bio}
              onChange={changeEventHandler}
              placeholder="e.g. 4th year CSE student passionate about Full Stack & Cloud"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Skills (Comma Separated)</Label>
            <Input
              id="skills"
              name="skills"
              type="text"
              value={input.skills}
              onChange={changeEventHandler}
              placeholder="e.g. React, Node.js, MySQL, Python"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Resume PDF (Upload PDF Only)
            </Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={changeFileHandler}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs cursor-pointer rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Profile Photo (PNG / JPG)
            </Label>
            <Input
              id="profilePhoto"
              name="profilePhoto"
              type="file"
              accept="image/*"
              onChange={changePhotoHandler}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs cursor-pointer rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            {loading ? (
              <Button disabled className="w-full bg-[#6A38C2] text-white rounded-xl">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
              </Button>
            ) : (
              <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white font-bold rounded-xl">
                Save Profile
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
