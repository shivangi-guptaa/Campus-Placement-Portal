import { PlacementPolicy } from "../models/index.js";

/**
 * Enterprise Eligibility & Placement Policy Checking Engine
 * @param {Object} student - Student user object with academic attributes & skills
 * @param {Object} drive - Placement Drive (Job) object with requirements
 * @param {Object} [customPolicy] - Optional custom placement policy
 * @returns {Object} { eligible: boolean, reasons: string[], matchScore: number, checklist: Array }
 */
export const checkStudentEligibility = async (student, drive, customPolicy = null) => {
  const reasons = [];
  const checklist = [];

  if (!student || !drive) {
    return {
      eligible: false,
      reasons: ["Invalid student or drive details provided."],
      matchScore: 0,
      checklist: [],
    };
  }

  // 1. Fetch active placement policy if not provided
  let policy = customPolicy;
  if (!policy) {
    try {
      policy = await PlacementPolicy.findOne({ where: { isActive: true } });
    } catch (err) {
      // Fallback default policy
      policy = {
        maxOffersAllowed: 1,
        allowPlacedStudentsToApply: false,
        minCtcIncreasePercentage: 50.0,
        dreamCompanyMinCtc: 10.0,
      };
    }
  }

  // 2. Opt-Out Policy Check
  const isOptedOut = student.placementStatus === "OPTED_OUT";
  if (isOptedOut) {
    reasons.push("Student has opted out of campus placement activities.");
  }
  checklist.push({
    rule: "Campus Placement Participation Status",
    passed: !isOptedOut,
    studentVal: student.placementStatus || "NOT_PLACED",
    reqVal: "Active (Not Opted-Out)",
  });

  // 3. Placement Policy & Prior Offer Rules Check
  const isAlreadyPlaced = student.placementStatus === "PLACED" || student.placementStatus === "MULTIPLE_OFFERS";
  const driveSalary = parseFloat(drive.salary || drive.ctc || 0);
  const currentPackage = parseFloat(student.currentPackage || 0);

  if (isAlreadyPlaced) {
    const isDreamOffer = policy?.dreamCompanyMinCtc && driveSalary >= policy.dreamCompanyMinCtc;
    const minRequiredCtc = currentPackage * (1 + (policy?.minCtcIncreasePercentage || 50.0) / 100);

    if (currentPackage > 0 && driveSalary <= currentPackage) {
      reasons.push(
        `Placement Policy Violation: Student is already placed at ${currentPackage} LPA. Drive offer (${driveSalary} LPA) is lower than or equal to current package.`
      );
    } else if (!isDreamOffer && driveSalary < minRequiredCtc) {
      reasons.push(
        `Placement Policy Violation: Drive package (${driveSalary} LPA) does not satisfy the institutional requirement of at least ${policy?.minCtcIncreasePercentage || 50}% increase over current package (${minRequiredCtc.toFixed(1)} LPA required).`
      );
    }
  }

  checklist.push({
    rule: "Placement Policy & Offer Upgrade Clearance",
    passed: !isAlreadyPlaced || (driveSalary > currentPackage && (driveSalary >= (currentPackage * 1.5) || driveSalary >= 10)),
    studentVal: isAlreadyPlaced ? `Placed (${currentPackage} LPA)` : "Unplaced",
    reqVal: isAlreadyPlaced ? `>= ${(currentPackage * 1.5).toFixed(1)} LPA or Dream Offer (>= 10 LPA)` : "Eligible for All",
  });

  // 4. CGPA Requirement Check
  const minCgpa = parseFloat(drive.minCgpa || 0);
  const studentCgpa = parseFloat(student.cgpa || 0);
  const cgpaPassed = studentCgpa >= minCgpa;
  if (!cgpaPassed) {
    reasons.push(`CGPA requirement not met (Your CGPA: ${studentCgpa}, Required: >= ${minCgpa}).`);
  }
  checklist.push({
    rule: "Minimum CGPA Criteria",
    passed: cgpaPassed,
    studentVal: `${studentCgpa} CGPA`,
    reqVal: `>= ${minCgpa} CGPA`,
  });

  // 5. Maximum Active Backlogs Check
  const maxBacklogs = parseInt(drive.maxBacklogs !== undefined ? drive.maxBacklogs : 0);
  const studentBacklogs = parseInt(student.backlogsCount || 0);
  const backlogsPassed = studentBacklogs <= maxBacklogs;
  if (!backlogsPassed) {
    reasons.push(`Active backlogs limit exceeded (Your Backlogs: ${studentBacklogs}, Allowed: <= ${maxBacklogs}).`);
  }
  checklist.push({
    rule: "Active Backlog Clearance",
    passed: backlogsPassed,
    studentVal: `${studentBacklogs} Backlogs`,
    reqVal: `<= ${maxBacklogs} Backlogs`,
  });

  // 6. Branch Requirement Check
  const branchReq = String(drive.branchRequirement || "All Branches").trim();
  let branchPassed = true;
  if (branchReq !== "All Branches" && branchReq !== "All" && branchReq !== "") {
    const allowedBranches = branchReq.split(",").map((b) => b.trim().toLowerCase());
    const studentBranch = String(student.branch || "").trim().toLowerCase();
    branchPassed = allowedBranches.some((b) => studentBranch.includes(b) || b.includes(studentBranch));
    if (!branchPassed) {
      reasons.push(`Branch not eligible (Your Branch: ${student.branch || "Unspecified"}, Eligible: ${branchReq}).`);
    }
  }
  checklist.push({
    rule: "Eligible Academic Disciplines / Branches",
    passed: branchPassed,
    studentVal: student.branch || "N/A",
    reqVal: branchReq,
  });

  // 7. Graduation Batch Year Check
  const driveBatch = parseInt(drive.batchYear || 0);
  const studentBatch = parseInt(student.batchYear || 0);
  const batchPassed = !driveBatch || driveBatch === studentBatch;
  if (!batchPassed) {
    reasons.push(`Graduation batch year mismatch (Your Batch: ${studentBatch}, Required: ${driveBatch}).`);
  }
  checklist.push({
    rule: "Graduating Batch Year",
    passed: batchPassed,
    studentVal: `${studentBatch} Batch`,
    reqVal: `${driveBatch} Batch`,
  });

  // 8. Technical Skills Compatibility Score
  const driveSkills = (drive.skills || []).map((s) => (typeof s === "string" ? s.toLowerCase() : s.name?.toLowerCase()));
  const studentSkills = (student.skills || []).map((s) => (typeof s === "string" ? s.toLowerCase() : s.name?.toLowerCase()));

  let skillMatchPercentage = 100;
  if (driveSkills.length > 0) {
    const matchedCount = driveSkills.filter((ds) => studentSkills.includes(ds)).length;
    skillMatchPercentage = Math.round((matchedCount / driveSkills.length) * 100);
  }

  // Composite Match Score Calculation (Academic + Skills)
  let matchScore = 50;
  if (cgpaPassed) matchScore += 25;
  if (backlogsPassed) matchScore += 10;
  if (branchPassed) matchScore += 15;
  matchScore = Math.min(100, Math.round((matchScore * 0.6) + (skillMatchPercentage * 0.4)));

  const isEligible = reasons.length === 0;

  return {
    eligible: isEligible,
    isEligible, // Backward compatibility alias
    reasons,
    matchScore,
    skillMatchPercentage,
    checklist,
  };
};

export default { checkStudentEligibility };
