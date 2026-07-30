import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constants";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";
import { Building2, Globe, MapPin, FileText, Loader2 } from "lucide-react";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    companyName: "",
    description: "",
    website: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const registerNewCompany = async (e) => {
    e.preventDefault();
    if (!input.companyName) {
      toast.error("Company name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${COMPANY_API_END_POINT}/register`,
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res?.data?.message);
        const companyId = res?.data?.company?.id || res?.data?.company?._id;
        navigate(`/admin/companies/${companyId}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to register company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors pb-12">
      <Navbar />
      <div className="max-w-2xl mx-auto my-10 px-4">
        <form
          onSubmit={registerNewCompany}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-5"
        >
          <div>
            <h1 className="font-black text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Register Partner Company
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Provide company details for hosting campus placement & internship drives
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Company Name*</Label>
            <Input
              type="text"
              name="companyName"
              value={input.companyName}
              onChange={changeEventHandler}
              placeholder="e.g. Microsoft / Google / RedHat"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> Company Description / Overview
            </Label>
            <Input
              type="text"
              name="description"
              value={input.description}
              onChange={changeEventHandler}
              placeholder="e.g. Leading provider of enterprise cloud computing & open-source solutions"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-purple-600" /> Official Website URL
              </Label>
              <Input
                type="text"
                name="website"
                value={input.website}
                onChange={changeEventHandler}
                placeholder="https://company.com"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" /> Headquarters / Location
              </Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                placeholder="e.g. Bangalore, India"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/companies")}
              className="dark:border-gray-700 dark:text-gray-200 rounded-xl"
            >
              Cancel
            </Button>
            {loading ? (
              <Button disabled className="bg-purple-600 text-white rounded-xl">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
              </Button>
            ) : (
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
                Continue to Setup
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyCreate;
