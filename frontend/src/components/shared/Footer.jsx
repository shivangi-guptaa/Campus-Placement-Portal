import React from "react";
import { Github, Linkedin, Heart, GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Skill<span className="text-[#6A38C2]">Sync</span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                Campus Portal
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Copyright &copy; 2026 SkillSync Campus Placement Portal. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1 font-semibold">
              Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> by{" "}
              <span className="text-purple-700 dark:text-purple-400 font-bold">Shivangi Gupta</span>
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400 ml-1 inline" /> (NIT Bhopal)
            </span>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/shivangi-guptaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full font-bold text-gray-800 dark:text-gray-200 border dark:border-gray-700 transition-all"
              >
                <Github className="w-4 h-4 text-gray-900 dark:text-white" /> GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/shivangi-gupta-nitbhopal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-full font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all"
              >
                <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
