import React from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

const CampusEligibilityCard = ({ eligibilityData }) => {
  if (!eligibilityData) return null;

  const { isEligible, matchPercentage, checklist, skillBreakdown } = eligibilityData;

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 my-4 transition-colors">
      <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Campus Eligibility & Skill Match</h3>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isEligible
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {isEligible ? "✅ ELIGIBLE TO APPLY" : "❌ NOT ELIGIBLE"}
        </div>
      </div>

      {/* Match Score Badge */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
        <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xl shadow">
          {matchPercentage}%
        </div>
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Automated Match Score</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Calculated via CGPA, Required Skills, Graduation Batch & Stream compatibility.
          </p>
        </div>
      </div>

      {/* Checklist Rules */}
      <div>
        <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Eligibility Checklist</h4>
        <div className="space-y-2">
          {checklist?.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between text-xs p-2 rounded-md ${
                item.status === "PASS"
                  ? "bg-green-50 text-green-900 dark:bg-green-950/50 dark:text-green-200"
                  : "bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-200 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2">
                {item.status === "PASS" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span>{item.message}</span>
              </div>
              <span className="text-[10px] uppercase font-bold opacity-75">{item.criterion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Breakdown */}
      {skillBreakdown && skillBreakdown.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Required Skills Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {skillBreakdown.map((sb, idx) => (
              <div
                key={idx}
                className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                  sb.status === "MATCHED"
                    ? "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/60 dark:border-purple-800 dark:text-purple-300"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 line-through"
                }`}
              >
                <span>{sb.skill}</span>
                <span className="font-bold text-[10px]">
                  {sb.status === "MATCHED" ? `${sb.matchPercent}%` : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusEligibilityCard;
