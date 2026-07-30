import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <div className="text-center px-4">
      <div className="flex flex-col gap-5 my-10 max-w-4xl mx-auto">
        <span className="mx-auto px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#6A38C2] dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-4 h-4" /> Official Campus Placement & Internship Management Portal
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          Verify Eligibility & Land Your <br />
          <span className="text-[#6A38C2] dark:text-purple-400">Campus Dream Offer</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          SkillSync connects university candidates with top tech companies (Google, Microsoft, Zomato) through automated eligibility evaluation and multi-factor skill matching.
        </p>

        <div className="flex w-full sm:w-[60%] shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pl-4 rounded-full items-center gap-3 mx-auto transition-colors">
          <input
            type="text"
            placeholder="Search drives by title, skill (React, Node, Python) or location..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
            className="outline-none border-none w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
          <Button
            onClick={searchJobHandler}
            className="rounded-r-full bg-[#6A38C2] hover:bg-[#5B30A6] text-white px-6"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
