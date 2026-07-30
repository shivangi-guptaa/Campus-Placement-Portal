/**
 * Campus Placement Eligibility & Skill Match Engine
 */
export const calculateEligibilityAndMatch = (user, job) => {
  const checklist = [];
  let isEligible = true;

  // 1. CGPA Check
  const minCgpa = job.minCgpa || 6.0;
  const userCgpa = user.cgpa || 0.0;
  if (userCgpa >= minCgpa) {
    checklist.push({
      criterion: "CGPA Requirement",
      status: "PASS",
      message: `✅ CGPA: ${userCgpa} (Required: ${minCgpa}+)`,
    });
  } else {
    isEligible = false;
    checklist.push({
      criterion: "CGPA Requirement",
      status: "FAIL",
      message: `❌ Required CGPA: ${minCgpa} (Your CGPA: ${userCgpa})`,
    });
  }

  // 2. Batch Year Check
  const targetBatch = job.batchYear || 2026;
  const userBatch = user.batchYear || 2026;
  if (userBatch === targetBatch) {
    checklist.push({
      criterion: "Graduation Batch",
      status: "PASS",
      message: `✅ Batch Year: ${userBatch} (Eligible)`,
    });
  } else {
    isEligible = false;
    checklist.push({
      criterion: "Graduation Batch",
      status: "FAIL",
      message: `❌ Target Batch: ${targetBatch} (Your Batch: ${userBatch})`,
    });
  }

  // 3. Branch / Degree Check
  const requiredBranch = job.branchRequirement || "All Branches";
  const userBranch = user.branch || "Computer Science";
  if (
    requiredBranch.toLowerCase() === "all branches" ||
    requiredBranch.toLowerCase().includes(userBranch.toLowerCase())
  ) {
    checklist.push({
      criterion: "Branch / Stream",
      status: "PASS",
      message: `✅ Branch: ${userBranch}`,
    });
  } else {
    isEligible = false;
    checklist.push({
      criterion: "Branch / Stream",
      status: "FAIL",
      message: `❌ Required Branch: ${requiredBranch} (Your Branch: ${userBranch})`,
    });
  }

  // 4. Backlogs Check
  const maxBacklogs = job.maxBacklogs || 0;
  const userBacklogs = user.backlogsCount || 0;
  if (userBacklogs <= maxBacklogs) {
    checklist.push({
      criterion: "Backlogs Allowed",
      status: "PASS",
      message: `✅ Active Backlogs: ${userBacklogs} (Max Allowed: ${maxBacklogs})`,
    });
  } else {
    isEligible = false;
    checklist.push({
      criterion: "Backlogs Allowed",
      status: "FAIL",
      message: `❌ Active Backlogs: ${userBacklogs} (Max Allowed: ${maxBacklogs})`,
    });
  }

  // 5. Skill Breakdown & Scoring Algorithm
  // Formula: Score = (50% Primary Skills) + (20% Skill Proficiency) + (15% CGPA) + (10% Location) + (5% Job Type)
  const jobSkillsList = job.skills || []; // array of skill objects
  const userSkillsList = user.skills || []; // array of skill objects with proficiency
  
  const userSkillMap = new Map();
  userSkillsList.forEach((s) => {
    const name = (s.name || "").toLowerCase();
    const prof = s.UserSkill?.proficiency || "Intermediate";
    let profWeight = 0.8;
    if (prof === "Expert") profWeight = 1.0;
    if (prof === "Beginner") profWeight = 0.5;
    userSkillMap.set(name, profWeight);
  });

  const skillBreakdown = [];
  let primaryMatchedCount = 0;
  let totalPrimary = 0;
  let skillProficiencyScoreSum = 0;

  if (jobSkillsList.length > 0) {
    jobSkillsList.forEach((sk) => {
      const skillName = sk.name;
      const isPrimary = sk.JobSkill ? sk.JobSkill.isPrimary : true;
      if (isPrimary) totalPrimary++;

      if (userSkillMap.has(skillName.toLowerCase())) {
        const weight = userSkillMap.get(skillName.toLowerCase());
        if (isPrimary) primaryMatchedCount++;
        skillProficiencyScoreSum += weight;

        skillBreakdown.push({
          skill: skillName,
          status: "MATCHED",
          matchPercent: Math.round(weight * 100),
          isPrimary,
        });
      } else {
        skillBreakdown.push({
          skill: skillName,
          status: "MISSING",
          matchPercent: 0,
          isPrimary,
        });
      }
    });
  } else {
    // If no explicit skills tagged on job, match requirement string keywords
    const reqText = (job.requirements || "").toLowerCase();
    userSkillsList.forEach((s) => {
      if (reqText.includes(s.name.toLowerCase())) {
        skillBreakdown.push({
          skill: s.name,
          status: "MATCHED",
          matchPercent: 100,
          isPrimary: true,
        });
        primaryMatchedCount++;
        totalPrimary++;
      }
    });
  }

  // Calculate Weighted Match Percentage
  const primarySkillWeight = totalPrimary > 0 ? (primaryMatchedCount / totalPrimary) * 50 : 50;
  const proficiencyWeight = jobSkillsList.length > 0 ? (skillProficiencyScoreSum / jobSkillsList.length) * 20 : 20;
  const cgpaScoreWeight = Math.min(15, (userCgpa / 10) * 15);
  const locationWeight = 10; // default 10%
  const jobTypeWeight = 5; // default 5%

  const totalMatchScore = Math.min(
    100,
    Math.round(primarySkillWeight + proficiencyWeight + cgpaScoreWeight + locationWeight + jobTypeWeight)
  );

  return {
    isEligible,
    matchPercentage: totalMatchScore,
    checklist,
    skillBreakdown,
  };
};
