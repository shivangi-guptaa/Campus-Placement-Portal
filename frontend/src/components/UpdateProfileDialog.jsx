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
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { USER_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";
import axios from "axios";
import { setUser } from "@/redux/authSlice";

const UpdateProfileDialog = ({ edit, setEdit }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    bio: user?.profile?.bio,
    skills: user?.profile?.skills?.map((skill) => skill),
    file: user?.profile?.resume,
    profilePhoto: user?.profile?.profilePhoto || null,
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

    // we send as a form data since file is being uploaded
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    if (input.file) {
      formData.append("file", input.file);
    }
    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto); // ✅ new field
    }

    // api call
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
      toast.error(error.response.data.message);
    } finally {
      setEdit(false);
      setLoading(false);
    }
    console.log(input);
  };

  return (
    <div>
      <Dialog open={edit}>
        <DialogContent
          className="flex flex-col gap-6 sm:w-[425px]"
          onInteractOutside={() => setEdit(false)}
        >
          <DialogHeader>
            <DialogTitle className="font-medium text-xl">
              Update profile
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="flex flex-col">
              <div className="flex flex-col gap-2 my-2">
                <Label className="font-medium text-lg">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  value={input.bio}
                  onChange={changeEventHandler}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label className="font-medium text-lg">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  type="text"
                  value={input.skills}
                  onChange={changeEventHandler}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label className="font-medium text-lg">Resume</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  onChange={changeFileHandler}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label className="font-medium text-lg">Profile Photo</Label>
                <Input
                  id="profilePhoto"
                  name="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={changePhotoHandler}
                />
              </div>
            </div>
            <DialogFooter>
              {loading ? (
                <Button className="w-full my-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </Button>
              ) : (
                <Button type="submit" className="w-full my-4">
                  Update
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProfileDialog;
