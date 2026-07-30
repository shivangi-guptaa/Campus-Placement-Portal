import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const JOB_ROLES = [
  "Software Development Engineer (SDE-I)",
  "Frontend React Developer",
  "Backend Node.js / Java Developer",
  "Full Stack Developer",
  "Data Analyst / Data Scientist",
  "Cloud & DevOps Engineer",
  "UI/UX Designer",
  "Others (Add Custom Role)",
];

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    customTitle: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "Full-time",
    experienceLevel: "0",
    positions: "1",
    companyId: "",
  });

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [loading, setLoading] = useState(false);

  const { companies } = useSelector((store) => store.company);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const roleChangeHandler = (value) => {
    if (value === "Others (Add Custom Role)") {
      setIsCustomRole(true);
      setInput({ ...input, title: "" });
    } else {
      setIsCustomRole(false);
      setInput({ ...input, title: value });
    }
  };

  const selectCompanyHandler = (value) => {
    const selectedCompany = companies.find(
      (c) => String(c.name).toLowerCase() === value.toLowerCase()
    );
    if (selectedCompany) {
      const cId = selectedCompany.id || selectedCompany._id;
      setInput({ ...input, companyId: cId });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const finalTitle = isCustomRole ? input.customTitle : input.title;

    if (!finalTitle || !input.description || !input.requirements || !input.salary || !input.location || !input.companyId) {
      toast.error("Please fill all required drive fields");
      return;
    }

    const payload = {
      ...input,
      title: finalTitle,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to post drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />
      <div className="flex items-center justify-center max-w-4xl mx-auto my-8 px-4">
        <form
          onSubmit={submitHandler}
          className="p-8 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl space-y-6"
        >
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Post New Campus Placement Drive</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Create a new hiring drive for eligible students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Dropdown */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Job Role / Title*</Label>
              <Select onValueChange={roleChangeHandler}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl">
                  <SelectValue placeholder="Choose Job Role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectGroup>
                    {JOB_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Role Input if 'Others' selected */}
            {isCustomRole ? (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Type Custom Job Role Title*
                </Label>
                <Input
                  type="text"
                  name="customTitle"
                  value={input.customTitle}
                  onChange={changeEventHandler}
                  placeholder="e.g. AI Prompt Engineer / Blockchain Dev"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl border-purple-500"
                  required
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Drive Description*</Label>
                <Input
                  type="text"
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  placeholder="e.g. 6-month internship with PPO conversion"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
                  required
                />
              </div>
            )}

            {isCustomRole && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Drive Description*</Label>
                <Input
                  type="text"
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  placeholder="e.g. 6-month internship with PPO conversion"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Requirements / Tech Stack*</Label>
              <Input
                type="text"
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                placeholder="e.g. React, Node.js, MySQL, Data Structures"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Salary (Package in LPA)*</Label>
              <Input
                type="number"
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                placeholder="e.g. 12"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Location*</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                placeholder="e.g. Bangalore / Remote"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Job Type*</Label>
              <Select onValueChange={(val) => setInput({ ...input, jobType: val })} defaultValue="Full-time">
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl">
                  <SelectValue placeholder="Full-time / Internship" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectItem value="Full-time">Full-time (FTE)</SelectItem>
                  <SelectItem value="Internship">Campus Internship</SelectItem>
                  <SelectItem value="PPO">PPO Opportunity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Min Experience (Years)</Label>
              <Input
                type="number"
                name="experienceLevel"
                value={input.experienceLevel}
                onChange={changeEventHandler}
                placeholder="0"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Number of Openings*</Label>
              <Input
                type="number"
                name="positions"
                value={input.positions}
                onChange={changeEventHandler}
                placeholder="e.g. 5"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
                required
              />
            </div>
          </div>

          <div className="w-full pt-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Hosting Company*</Label>
            {companies && companies.length > 0 ? (
              <Select onValueChange={selectCompanyHandler}>
                <SelectTrigger className="w-full mt-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl">
                  <SelectValue placeholder="Choose Registered Company" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectGroup>
                    {companies.map((company) => {
                      const cId = company.id || company._id;
                      return (
                        <SelectItem key={cId} value={company.name}>
                          {company.name} ({company.location || "India"})
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-red-500 font-bold mt-2">
                *Please register a company first in Companies section before posting a drive.
              </p>
            )}
          </div>

          {loading ? (
            <Button disabled className="w-full bg-[#6A38C2] text-white rounded-xl">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing Drive...
            </Button>
          ) : (
            <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white font-bold rounded-xl">
              Publish Placement Drive
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostJob;
