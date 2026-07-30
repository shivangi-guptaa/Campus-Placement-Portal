import React, { useEffect, useState } from "react";
import axios from "axios";
import { ANALYTICS_API_END_POINT } from "@/utils/constants";
import Navbar from "@/components/shared/Navbar";
import { Building2, Briefcase, Users, TrendingUp, Award } from "lucide-react";

const TpoDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${ANALYTICS_API_END_POINT}/tpo`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error("Fetch TPO Analytics Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center text-gray-500 font-medium">
          Loading Placement Statistics...
        </div>
      </div>
    );
  }

  const { stats, funnel, topSkills, topCompanyDrives } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Training & Placement Officer (TPO) Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time Placement Drive Metrics, Student Conversions & Analytics
            </p>
          </div>
          <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Batch 2026 Live Portal
          </span>
        </div>

        {/* Stats Counters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Companies Visited</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalCompanies || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Placement Drives</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalDrives || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Placed Students</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.totalPlacedStudents || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Highest Package</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats?.highestPackageLpa || 0} LPA</h3>
            </div>
          </div>
        </div>

        {/* Funnel & Top Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Hiring Funnel */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Placement Conversion Funnel
            </h3>
            <div className="space-y-4">
              {funnel?.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span className="capitalize">{item.status.replace("_", " ")}</span>
                    <span>{item.count} Candidates</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 dark:bg-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, item.count * 20)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top In-Demand Skills */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Top Demanded Tech Skills
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {topSkills?.map((sk, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{sk.skillName}</span>
                  <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">
                    {sk.demandCount} Drives
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Company Drives Table */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Package Offers by Company (SQL Rank Query)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/80 border-b dark:border-gray-800 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="p-3">Company</th>
                  <th className="p-3">Drive Title</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Package (CTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {topCompanyDrives?.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{row.companyName}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{row.title}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">{row.location}</td>
                    <td className="p-3 font-bold text-green-700 dark:text-green-400">{row.salary} LPA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TpoDashboard;
