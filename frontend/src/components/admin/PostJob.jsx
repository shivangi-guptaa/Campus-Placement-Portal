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
import { Loader2, PlusCircle, ShieldCheck, ExternalLink, AlertCircle } from "lucide-react";
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
    driveType: "ON_CAMPUS",
    minCgpa: "7.0",
    batchYear: "2026",
    branchRequirement: "All Branches",
    maxBacklogs: "0",
    positions: "1",
    externalUrl: "",
    companyId: "",
  });

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [loading, setLoading] = useState(false);

  const { companies } = useSelector((store) => store.company);
  const { user } = useSelector((store) => store.auth);
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
      salary: parseInt(input.salary),
      minCgpa: parseFloat(input.minCgpa),
      batchYear: parseInt(input.batchYear),
      maxBacklogs: parseInt(input.maxBacklogs),
      positions: parseInt(input.positions),
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
      toast.error(error.response?.data?.message || "Failed to post placement drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />
      <div className="flex items-center justify-center w-screen my-5 px-4">
        <form
          onSubmit={submitHandler}
          className="p-8 max-w-4xl border border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl bg-white dark:bg-gray-900 w-full space-y-6"
        >
          <div>
            <div className="flex items-center justify-between">
              <h1 className="font-black text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Create Placement Drive / Opportunity
              </h1>
              <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                TPO Compliance Engine
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              On-Campus drives are reviewed and approved by the TPO Office before being published to eligible students.
            </p>
          </div>

          {/* Workflow Alert */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 dark:text-purple-200">
              <p className="font-bold">Campus Drive Approval Workflow:</p>
              <p className="text-purple-700 dark:text-purple-300 mt-0.5">
                1. Recruiter creates drive → 2. Drive submitted in <strong>PENDING_APPROVAL</strong> state → 3. TPO verifies institutional criteria and <strong>Publishes</strong> to eligible students.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drive Type */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Drive Category / Type</Label>
              <select
                name="driveType"
                value={input.driveType}
                onChange={changeEventHandler}
                className="w-full h-10 border rounded-xl px-3 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-medium"
              >
                <option value="ON_CAMPUS">🎓 On-Campus Placement Drive (TPO Managed)</option>
                <option value="OFF_CAMPUS">🌐 Off-Campus Opportunity (External Direct)</option>
              </select>
            </div>

            {/* Select Role */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Job Role / Designation</Label>
              <Select onValueChange={roleChangeHandler} defaultValue={input.title}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 rounded-xl">
                  <SelectValue placeholder="Select standard role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectGroup>
                    {JOB_ROLES.map((role, idx) => (
                      <SelectItem key={idx} value={role} className="dark:text-gray-200">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {isCustomRole && (
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-bold">Custom Job Designation</Label>
                <Input
                  type="text"
                  name="customTitle"
                  value={input.customTitle}
                  onChange={changeEventHandler}
                  placeholder="e.g. AI Prompt Engineer / Quant Analyst"
                  className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
            )}

            {/* Select Company */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Hiring Company Profile</Label>
              {companies.length > 0 ? (
                <Select onValueChange={selectCompanyHandler}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 rounded-xl">
                    <SelectValue placeholder="Select verified company" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem key={company.id || company._id} value={company.name} className="dark:text-gray-200">
                          {company.name} {company.status ? `(${company.status})` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-red-500 font-bold mt-2">
                  No company profiles found. Please register your company profile first.
                </p>
              )}
            </div>

            {/* CTC Package */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Offered Package / CTC (LPA)</Label>
              <Input
                type="number"
                step="0.5"
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                placeholder="e.g. 18 (for 18 LPA)"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Work Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                placeholder="e.g. Bengaluru / Hyderabad / Remote"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
                required
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Employment Type</Label>
              <select
                name="jobType"
                value={input.jobType}
                onChange={changeEventHandler}
                className="w-full h-10 border rounded-xl px-3 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-medium"
              >
                <option value="Full-time">Full-time (FTE)</option>
                <option value="Internship">Internship with PPO</option>
                <option value="PPO">Pre-Placement Offer (PPO)</option>
              </select>
            </div>

            {/* Min CGPA Requirement */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Minimum Cutoff CGPA</Label>
              <Input
                type="number"
                step="0.1"
                name="minCgpa"
                value={input.minCgpa}
                onChange={changeEventHandler}
                placeholder="e.g. 7.5"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
              />
            </div>

            {/* Eligible Branch */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Eligible Disciplines / Branches</Label>
              <Input
                type="text"
                name="branchRequirement"
                value={input.branchRequirement}
                onChange={changeEventHandler}
                placeholder="e.g. Computer Science, IT, ECE (or All Branches)"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
              />
            </div>

            {/* Batch Year */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Graduation Batch Year</Label>
              <Input
                type="number"
                name="batchYear"
                value={input.batchYear}
                onChange={changeEventHandler}
                placeholder="2026"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
              />
            </div>

            {/* Max Backlogs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Max Active Backlogs Allowed</Label>
              <Input
                type="number"
                name="maxBacklogs"
                value={input.maxBacklogs}
                onChange={changeEventHandler}
                placeholder="0"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
              />
            </div>

            {/* Number of Openings */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Total Expected Vacancies</Label>
              <Input
                type="number"
                name="positions"
                value={input.positions}
                onChange={changeEventHandler}
                placeholder="5"
                className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
              />
            </div>

            {input.driveType === "OFF_CAMPUS" && (
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-bold">External Application URL</Label>
                <Input
                  type="url"
                  name="externalUrl"
                  value={input.externalUrl}
                  onChange={changeEventHandler}
                  placeholder="https://company.careers/job/123"
                  className="dark:bg-gray-800 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-bold">Drive Description & Scope of Work</Label>
              <textarea
                name="description"
                rows={3}
                value={input.description}
                onChange={changeEventHandler}
                placeholder="Detailed description of the placement opportunity, engineering team responsibilities, and technologies."
                className="w-full border rounded-xl p-3 text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Requirements */}
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-bold">Technical Requirements & Skill Prerequisites</Label>
              <textarea
                name="requirements"
                rows={2}
                value={input.requirements}
                onChange={changeEventHandler}
                placeholder="Key tech stack prerequisites, data structures, relational databases, communication skills."
                className="w-full border rounded-xl p-3 text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6A38C2] hover:bg-[#582da7] text-white font-bold rounded-2xl h-11 transition-all shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Placement Drive...
              </>
            ) : (
              "Submit Placement Drive for TPO Authorization"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
