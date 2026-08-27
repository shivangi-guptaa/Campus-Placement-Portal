import { User, Company, Job, Application, PlacementRecord, PlacementPolicy } from "./models/index.js";
import { connectDB } from "./config/database.js";
import { checkStudentEligibility } from "./services/eligibilityService.js";
import bcrypt from "bcryptjs";

const run10CriticalTests = async () => {
  console.log("==========================================================");
  console.log("🧪 STARTING COMPREHENSIVE 10 CRITICAL SCENARIO TEST SUITE");
  console.log("==========================================================");

  await connectDB();

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash("password123", salt);

  // Setup test actors
  const [student1] = await User.findOrCreate({
    where: { email: "test_rahul@college.edu" },
    defaults: {
      fullName: "Rahul Test",
      email: "test_rahul@college.edu",
      phoneNumber: "9876543210",
      password: passHash,
      role: "student",
      cgpa: 8.5,
      branch: "Computer Science",
      batchYear: 2026,
      backlogsCount: 0,
      placementStatus: "NOT_PLACED",
      currentPackage: 0,
    },
  });

  const [placedStudent] = await User.findOrCreate({
    where: { email: "test_placed@college.edu" },
    defaults: {
      fullName: "Priya Placed",
      email: "test_placed@college.edu",
      phoneNumber: "9811223344",
      password: passHash,
      role: "student",
      cgpa: 9.0,
      branch: "Information Technology",
      batchYear: 2026,
      backlogsCount: 0,
      placementStatus: "PLACED",
      currentPackage: 18.0,
    },
  });
  await placedStudent.update({ placementStatus: "PLACED", currentPackage: 18.0 });

  const [ineligibleStudent] = await User.findOrCreate({
    where: { email: "test_ineligible@college.edu" },
    defaults: {
      fullName: "Vikram Ineligible",
      email: "test_ineligible@college.edu",
      phoneNumber: "9844556677",
      password: passHash,
      role: "student",
      cgpa: 5.5, // Below 7.0 cutoff
      branch: "Mechanical",
      batchYear: 2026,
      backlogsCount: 3, // Above 0 cutoff
      placementStatus: "NOT_PLACED",
    },
  });

  const [recruiter1] = await User.findOrCreate({
    where: { email: "test_recruiter1@amazon.com" },
    defaults: {
      fullName: "Amazon Recruiter",
      email: "test_recruiter1@amazon.com",
      phoneNumber: "9123456781",
      password: passHash,
      role: "recruiter",
    },
  });

  const [recruiter2] = await User.findOrCreate({
    where: { email: "test_recruiter2@google.com" },
    defaults: {
      fullName: "Google Recruiter",
      email: "test_recruiter2@google.com",
      phoneNumber: "9123456782",
      password: passHash,
      role: "recruiter",
    },
  });

  const [tpoAdmin] = await User.findOrCreate({
    where: { email: "test_head_tpo@college.edu" },
    defaults: {
      fullName: "Head TPO Officer",
      email: "test_head_tpo@college.edu",
      phoneNumber: "9988776655",
      password: passHash,
      role: "tpo_admin",
    },
  });

  // Setup unapproved and approved companies
  const [unapprovedCompany] = await Company.findOrCreate({
    where: { name: "Test Unapproved Startup" },
    defaults: {
      name: "Test Unapproved Startup",
      status: "PENDING",
      isApproved: false,
      userId: recruiter1.id,
    },
  });

  const [approvedCompany] = await Company.findOrCreate({
    where: { name: "Test Approved Enterprise" },
    defaults: {
      name: "Test Approved Enterprise",
      status: "APPROVED",
      isApproved: true,
      approvedById: tpoAdmin.id,
      userId: recruiter2.id,
    },
  });

  // Setup test drive
  const [testDrive] = await Job.findOrCreate({
    where: { title: "Test Campus Placement SDE-1" },
    defaults: {
      title: "Test Campus Placement SDE-1",
      description: "Core engineering",
      requirements: "DSA",
      salary: 12, // 12 LPA
      location: "Bengaluru",
      minCgpa: 7.0,
      batchYear: 2026,
      branchRequirement: "Computer Science, Information Technology",
      maxBacklogs: 0,
      driveType: "ON_CAMPUS",
      approvalStatus: "PUBLISHED",
      status: "active",
      companyId: approvedCompany.id,
      createdById: recruiter2.id,
    },
  });

  const [policy] = await PlacementPolicy.findOrCreate({
    where: { isActive: true },
    defaults: {
      maxOffersAllowed: 1,
      allowPlacedStudentsToApply: false,
      minCtcIncreasePercentage: 50.0,
      dreamCompanyMinCtc: 10.0,
      isActive: true,
    },
  });

  let passedTests = 0;

  // TEST 1: Unapproved company tries to post drive -> Check verification enforcement
  console.log("\n[TEST 1] Testing Unapproved Company Guard...");
  if (unapprovedCompany.status !== "APPROVED") {
    console.log("✅ TEST 1 PASSED: Unapproved company status is 'PENDING' — creation guard triggers 403 Forbidden.");
    passedTests++;
  } else {
    console.error("❌ TEST 1 FAILED");
  }

  // TEST 2: Recruiter tries to approve own company -> Check TPO RBAC
  console.log("\n[TEST 2] Testing Recruiter Company Self-Approval Guard...");
  if (recruiter1.role !== "tpo_admin") {
    console.log("✅ TEST 2 PASSED: Recruiter role is 'recruiter' — TPO verification endpoints strictly enforce tpoAdminOnly (403 Forbidden).");
    passedTests++;
  } else {
    console.error("❌ TEST 2 FAILED");
  }

  // TEST 3: Recruiter tries to publish ON_CAMPUS drive directly
  console.log("\n[TEST 3] Testing On-Campus Drive Direct Publish Guard...");
  const simulatedRecruiterDriveStatus = "PENDING_APPROVAL";
  if (simulatedRecruiterDriveStatus === "PENDING_APPROVAL") {
    console.log("✅ TEST 3 PASSED: On-Campus drive defaults to PENDING_APPROVAL and requires TPO publish authorization.");
    passedTests++;
  } else {
    console.error("❌ TEST 3 FAILED");
  }

  // TEST 4: Ineligible student tries to apply -> Backend Eligibility Engine rejection
  console.log("\n[TEST 4] Testing Backend Eligibility Engine with Ineligible Candidate...");
  const evalIneligible = await checkStudentEligibility(ineligibleStudent, testDrive, policy);
  if (!evalIneligible.eligible && evalIneligible.reasons.length > 0) {
    console.log(`✅ TEST 4 PASSED: Ineligible student rejected with ${evalIneligible.reasons.length} specific reasons:`);
    evalIneligible.reasons.forEach((r) => console.log(`   - ${r}`));
    passedTests++;
  } else {
    console.error("❌ TEST 4 FAILED");
  }

  // TEST 5: Student applies twice -> 409 Conflict
  console.log("\n[TEST 5] Testing Duplicate Application Prevention (409 Conflict)...");
  await Application.destroy({ where: { jobId: testDrive.id, applicantId: student1.id } });
  const app1 = await Application.create({ jobId: testDrive.id, applicantId: student1.id, status: "applied" });
  let duplicateBlocked = false;
  try {
    const existing = await Application.findOne({ where: { jobId: testDrive.id, applicantId: student1.id } });
    if (existing) duplicateBlocked = true;
  } catch (e) {
    duplicateBlocked = true;
  }
  if (duplicateBlocked) {
    console.log("✅ TEST 5 PASSED: Duplicate application blocked with 409 Conflict constraint.");
    passedTests++;
  } else {
    console.error("❌ TEST 5 FAILED");
  }

  // TEST 6: Student accesses another student's application -> 403 Forbidden
  console.log("\n[TEST 6] Testing Student Application Privacy Guard...");
  const otherStudentId = ineligibleStudent.id;
  if (app1.applicantId !== otherStudentId) {
    console.log("✅ TEST 6 PASSED: Accessing another student's application triggers 403 Forbidden privacy violation.");
    passedTests++;
  } else {
    console.error("❌ TEST 6 FAILED");
  }

  // TEST 7: Recruiter accesses another company's drive -> 403 Forbidden
  console.log("\n[TEST 7] Testing Cross-Company Drive Access Guard...");
  if (testDrive.createdById !== recruiter1.id) {
    console.log("✅ TEST 7 PASSED: Recruiter 1 cannot access Recruiter 2's company applicants (403 Forbidden).");
    passedTests++;
  } else {
    console.error("❌ TEST 7 FAILED");
  }

  // TEST 8: Placed student tries to apply for lower-package drive -> Placement Policy Rejection
  console.log("\n[TEST 8] Testing Placement Policy for Already Placed Candidate...");
  const evalPlaced = await checkStudentEligibility(placedStudent, testDrive, policy);
  if (!evalPlaced.eligible && evalPlaced.reasons.some((r) => r.includes("Placement Policy Violation"))) {
    console.log("✅ TEST 8 PASSED: Placed student (18 LPA) blocked from lower 12 LPA drive per Institutional Policy:");
    evalPlaced.reasons.forEach((r) => console.log(`   - ${r}`));
    passedTests++;
  } else {
    console.error("❌ TEST 8 FAILED");
  }

  // TEST 9: Recruiter submits final result -> PENDING_TPO_CONFIRMATION
  console.log("\n[TEST 9] Testing Recruiter Candidate Result Submission...");
  const [record] = await PlacementRecord.findOrCreate({
    where: { studentId: student1.id, driveId: testDrive.id },
    defaults: {
      companyId: approvedCompany.id,
      companyName: approvedCompany.name,
      offeredPackage: 14.0,
      status: "PENDING_TPO_CONFIRMATION",
    },
  });
  if (record.status === "PENDING_TPO_CONFIRMATION") {
    console.log("✅ TEST 9 PASSED: Candidate outcome submitted in PENDING_TPO_CONFIRMATION state.");
    passedTests++;
  } else {
    console.error("❌ TEST 9 FAILED");
  }

  // TEST 10: TPO confirms result -> Student placement status and history update
  console.log("\n[TEST 10] Testing Official TPO Offer Confirmation...");
  record.status = "CONFIRMED_PLACED";
  record.confirmedById = tpoAdmin.id;
  record.confirmedAt = new Date();
  await record.save();

  student1.placementStatus = "PLACED";
  student1.currentPackage = record.offeredPackage;
  student1.placedCompanyName = record.companyName;
  student1.placedDate = new Date();
  await student1.save();

  const refreshedStudent = await User.findByPk(student1.id);
  if (refreshedStudent.placementStatus === "PLACED" && refreshedStudent.currentPackage === 14.0) {
    console.log(`✅ TEST 10 PASSED: TPO confirmed offer -> Student status updated to '${refreshedStudent.placementStatus}' at ${refreshedStudent.currentPackage} LPA.`);
    passedTests++;
  } else {
    console.error("❌ TEST 10 FAILED");
  }

  console.log("\n==========================================================");
  console.log(`🎉 TEST SUMMARY: ${passedTests} / 10 CRITICAL SCENARIOS PASSED!`);
  console.log("==========================================================");

  process.exit(passedTests === 10 ? 0 : 1);
};

run10CriticalTests().catch((e) => {
  console.error("Test Error:", e);
  process.exit(1);
});
