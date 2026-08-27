import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB, sequelize } from "./config/database.js";
import { User, Company, Job, Application, PlacementRecord, PlacementPolicy } from "./models/index.js";
import { JWT_SECRET } from "./config/jwtConfig.js";

import userRouter from "./routes/user.route.js";
import companyRouter from "./routes/company.route.js";
import jobRouter from "./routes/job.route.js";
import applicationRouter from "./routes/application.route.js";
import roundRouter from "./routes/round.route.js";
import resultRouter from "./routes/result.route.js";
import policyRouter from "./routes/policy.route.js";

// Isolated Express App instance for real HTTP testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/application", applicationRouter);
app.use("/api/rounds", roundRouter);
app.use("/api/results", resultRouter);
app.use("/api/policy", policyRouter);

const runComprehensiveIntegrationTests = async () => {
  console.log("=========================================================================");
  console.log("🚀 STARTING EXPANDED REAL HTTP INTEGRATION & SECURITY TEST SUITE (24 TESTS)");
  console.log("=========================================================================");

  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`[HTTP Test Server] Live at ${baseUrl}`);

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash("password123", salt);

  // Setup Database Test Actors
  const [student1] = await User.findOrCreate({
    where: { email: "full_student1@college.edu" },
    defaults: {
      fullName: "Rahul Student",
      email: "full_student1@college.edu",
      phoneNumber: "9876543211",
      password: passHash,
      role: "student",
      cgpa: 8.5,
      branch: "Computer Science",
      batchYear: 2026,
      backlogsCount: 0,
      placementStatus: "NOT_PLACED",
      currentPackage: 0.0,
    },
  });
  await student1.update({ cgpa: 8.5, branch: "Computer Science", batchYear: 2026, backlogsCount: 0, placementStatus: "NOT_PLACED", currentPackage: 0.0 });

  const [student2] = await User.findOrCreate({
    where: { email: "full_student2@college.edu" },
    defaults: {
      fullName: "Other Student",
      email: "full_student2@college.edu",
      phoneNumber: "9876543212",
      password: passHash,
      role: "student",
      cgpa: 8.0,
      branch: "Computer Science",
      batchYear: 2026,
      backlogsCount: 0,
      placementStatus: "NOT_PLACED",
      currentPackage: 0.0,
    },
  });

  const [placedStudent] = await User.findOrCreate({
    where: { email: "full_placed@college.edu" },
    defaults: {
      fullName: "Priya Placed",
      email: "full_placed@college.edu",
      phoneNumber: "9811223345",
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
  await placedStudent.update({ placementStatus: "PLACED", currentPackage: 18.0, cgpa: 9.0, branch: "Information Technology" });

  const [optedOutStudent] = await User.findOrCreate({
    where: { email: "full_optedout@college.edu" },
    defaults: {
      fullName: "Amit OptedOut",
      email: "full_optedout@college.edu",
      phoneNumber: "9822334466",
      password: passHash,
      role: "student",
      cgpa: 8.2,
      branch: "Electronics",
      batchYear: 2026,
      backlogsCount: 0,
      placementStatus: "OPTED_OUT",
      currentPackage: 0.0,
    },
  });
  await optedOutStudent.update({ placementStatus: "OPTED_OUT", currentPackage: 0.0 });

  const [ineligibleStudent] = await User.findOrCreate({
    where: { email: "full_ineligible@college.edu" },
    defaults: {
      fullName: "Vikram Ineligible",
      email: "full_ineligible@college.edu",
      phoneNumber: "9844556678",
      password: passHash,
      role: "student",
      cgpa: 5.5,
      branch: "Mechanical",
      batchYear: 2026,
      backlogsCount: 3,
      placementStatus: "NOT_PLACED",
    },
  });
  await ineligibleStudent.update({ cgpa: 5.5, branch: "Mechanical", batchYear: 2026, backlogsCount: 3, placementStatus: "NOT_PLACED" });

  const [recruiter1] = await User.findOrCreate({
    where: { email: "full_recruiter1@amazon.com" },
    defaults: {
      fullName: "Amazon Recruiter",
      email: "full_recruiter1@amazon.com",
      phoneNumber: "9123456783",
      password: passHash,
      role: "recruiter",
    },
  });

  const [recruiter2] = await User.findOrCreate({
    where: { email: "full_recruiter2@google.com" },
    defaults: {
      fullName: "Google Recruiter",
      email: "full_recruiter2@google.com",
      phoneNumber: "9123456784",
      password: passHash,
      role: "recruiter",
    },
  });

  const [tpoAdmin] = await User.findOrCreate({
    where: { email: "full_tpo@college.edu" },
    defaults: {
      fullName: "Head TPO Officer",
      email: "full_tpo@college.edu",
      phoneNumber: "9988776656",
      password: passHash,
      role: "tpo_admin",
    },
  });

  // Setup Real JWT Tokens
  const tokenStudent1 = jwt.sign({ userId: student1.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenStudent2 = jwt.sign({ userId: student2.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenPlaced = jwt.sign({ userId: placedStudent.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenOptedOut = jwt.sign({ userId: optedOutStudent.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenIneligible = jwt.sign({ userId: ineligibleStudent.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenRecruiter1 = jwt.sign({ userId: recruiter1.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenRecruiter2 = jwt.sign({ userId: recruiter2.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenTpo = jwt.sign({ userId: tpoAdmin.id }, JWT_SECRET, { expiresIn: "1d" });

  // Setup Companies
  const [unapprovedCompany] = await Company.findOrCreate({
    where: { name: "Full Unapproved Startup" },
    defaults: {
      name: "Full Unapproved Startup",
      status: "PENDING",
      isApproved: false,
      userId: recruiter1.id,
    },
  });
  await unapprovedCompany.update({ status: "PENDING", isApproved: false, userId: recruiter1.id });

  const [approvedCompany] = await Company.findOrCreate({
    where: { name: "Full Approved Tech Corp" },
    defaults: {
      name: "Full Approved Tech Corp",
      status: "APPROVED",
      isApproved: true,
      approvedById: tpoAdmin.id,
      userId: recruiter2.id,
    },
  });
  await approvedCompany.update({ status: "APPROVED", isApproved: true, approvedById: tpoAdmin.id, userId: recruiter2.id });

  // Setup Active Placement Policy
  const [policy] = await PlacementPolicy.findOrCreate({
    where: { isActive: true },
    defaults: {
      name: "Standard Campus Policy",
      maxOffersAllowed: 1,
      allowPlacedStudentsToApply: false,
      minCtcIncreasePercentage: 50.0,
      dreamCompanyMinCtc: 10.0,
      isActive: true,
    },
  });
  await policy.update({ maxOffersAllowed: 1, allowPlacedStudentsToApply: false, minCtcIncreasePercentage: 50.0, dreamCompanyMinCtc: 10.0, isActive: true });

  // Setup Drives in Different States
  const [publishedDrive] = await Job.findOrCreate({
    where: { title: "Full Live Campus Drive SDE" },
    defaults: {
      title: "Full Live Campus Drive SDE",
      description: "Software engineering role",
      requirements: "DSA and Node.js",
      salary: 12,
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
  await publishedDrive.update({
    salary: 12,
    minCgpa: 7.0,
    batchYear: 2026,
    branchRequirement: "Computer Science, Information Technology",
    maxBacklogs: 0,
    driveType: "ON_CAMPUS",
    approvalStatus: "PUBLISHED",
    status: "active",
    companyId: approvedCompany.id,
    createdById: recruiter2.id,
  });

  const [draftDrive] = await Job.findOrCreate({
    where: { title: "Full Draft Drive" },
    defaults: {
      title: "Full Draft Drive",
      description: "Draft",
      requirements: "Draft",
      salary: 10,
      location: "Delhi",
      approvalStatus: "DRAFT",
      status: "inactive",
      companyId: approvedCompany.id,
      createdById: recruiter2.id,
    },
  });
  await draftDrive.update({ approvalStatus: "DRAFT", status: "inactive" });

  const [rejectedDrive] = await Job.findOrCreate({
    where: { title: "Full Rejected Drive" },
    defaults: {
      title: "Full Rejected Drive",
      description: "Rejected",
      requirements: "Rejected",
      salary: 8,
      location: "Delhi",
      approvalStatus: "REJECTED",
      status: "inactive",
      companyId: approvedCompany.id,
      createdById: recruiter2.id,
    },
  });
  await rejectedDrive.update({ approvalStatus: "REJECTED", status: "inactive" });

  const [closedDrive] = await Job.findOrCreate({
    where: { title: "Full Closed Drive" },
    defaults: {
      title: "Full Closed Drive",
      description: "Closed",
      requirements: "Closed",
      salary: 15,
      location: "Delhi",
      approvalStatus: "CLOSED",
      status: "inactive",
      companyId: approvedCompany.id,
      createdById: recruiter2.id,
    },
  });
  await closedDrive.update({ approvalStatus: "CLOSED", status: "inactive" });

  const [completedDrive] = await Job.findOrCreate({
    where: { title: "Full Completed Drive" },
    defaults: {
      title: "Full Completed Drive",
      description: "Completed",
      requirements: "Completed",
      salary: 20,
      location: "Delhi",
      approvalStatus: "COMPLETED",
      status: "inactive",
      companyId: approvedCompany.id,
      createdById: recruiter2.id,
    },
  });
  await completedDrive.update({ approvalStatus: "COMPLETED", status: "inactive" });

  const [expiredDeadlineDrive] = await Job.findOrCreate({
    where: { title: "Full Expired Deadline Drive" },
    defaults: {
      title: "Full Expired Deadline Drive",
      description: "Expired",
      requirements: "Expired",
      salary: 14,
      location: "Delhi",
      approvalStatus: "PUBLISHED",
      status: "active",
      applicationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Past
      companyId: approvedCompany.id,
      createdById: recruiter2.id,
    },
  });
  await expiredDeadlineDrive.update({
    approvalStatus: "PUBLISHED",
    status: "active",
    applicationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
  });

  const testResults = [];

  // Helper to record result
  const record = (id, name, pass, actualStatus, expectedStatus, details) => {
    testResults.push({ id, name, status: pass ? "PASS" : "FAIL", actual: actualStatus, expected: expectedStatus, details });
    console.log(`Test ${id.toString().padStart(2, "0")} [${pass ? "PASS" : "FAIL"}] - ${name} (Status: ${actualStatus}, Expected: ${expectedStatus})`);
  };

  // ---------------------------------------------------------
  // 1. Unapproved Company Posting Drive (403)
  // ---------------------------------------------------------
  const res1 = await fetch(`${baseUrl}/job/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter1}` },
    body: JSON.stringify({ title: "Drive 1", description: "D", requirements: "R", salary: 10, location: "Delhi", companyId: unapprovedCompany.id, driveType: "ON_CAMPUS" }),
  });
  record(1, "Unapproved Company Post Drive Guard", res1.status === 403, res1.status, 403);

  // ---------------------------------------------------------
  // 2. Recruiter Approve Own Company (403)
  // ---------------------------------------------------------
  const res2 = await fetch(`${baseUrl}/company/${unapprovedCompany.id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenRecruiter1}` },
  });
  record(2, "Recruiter Approve Own Company RBAC", res2.status === 403, res2.status, 403);

  // ---------------------------------------------------------
  // 3. Recruiter Direct Publish Guard (Creates as PENDING_APPROVAL)
  // ---------------------------------------------------------
  const res3 = await fetch(`${baseUrl}/job/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter2}` },
    body: JSON.stringify({ title: "New OnCampus Drive", description: "D", requirements: "R", salary: 15, location: "Pune", companyId: approvedCompany.id, driveType: "ON_CAMPUS" }),
  });
  const body3 = await res3.json();
  record(3, "Recruiter Direct Publish Guard", res3.status === 201 && body3.job?.approvalStatus === "PENDING_APPROVAL", res3.status, 201);

  // ---------------------------------------------------------
  // 4. Ineligible Student Application (400)
  // ---------------------------------------------------------
  const res4 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenIneligible}` },
    body: JSON.stringify({ coverLetter: "Ineligible application" }),
  });
  const body4 = await res4.json();
  record(4, "Ineligible Student Application Engine", res4.status === 400 && body4.reasons?.length >= 3, res4.status, 400);

  // ---------------------------------------------------------
  // 5. Duplicate Application (1st: 201, 2nd: 409)
  // ---------------------------------------------------------
  await Application.destroy({ where: { jobId: publishedDrive.id, applicantId: student1.id } });
  const res5a = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` },
    body: JSON.stringify({ coverLetter: "1st" }),
  });
  const body5a = await res5a.json();
  const res5b = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` },
    body: JSON.stringify({ coverLetter: "2nd" }),
  });
  record(5, "Duplicate Student Application 409", res5a.status === 201 && res5b.status === 409, res5b.status, 409);

  // ---------------------------------------------------------
  // 6. Cross-Student Application Privacy (403)
  // ---------------------------------------------------------
  const student1App = body5a.application;
  const res6 = await fetch(`${baseUrl}/application/${student1App.id}/withdraw`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenStudent2}` },
  });
  record(6, "Cross-Student Application Privacy", res6.status === 403, res6.status, 403);

  // ---------------------------------------------------------
  // 7. Cross-Company Drive Access Isolation (403)
  // ---------------------------------------------------------
  const res7 = await fetch(`${baseUrl}/application/${publishedDrive.id}/applicants`, {
    method: "GET",
    headers: { Authorization: `Bearer ${tokenRecruiter1}` },
  });
  record(7, "Cross-Company Drive Access Isolation", res7.status === 403, res7.status, 403);

  // ---------------------------------------------------------
  // 8. Placed Student Policy Guard (400)
  // ---------------------------------------------------------
  const res8 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlaced}` },
    body: JSON.stringify({ coverLetter: "Lower drive" }),
  });
  record(8, "Placed Student Lower Drive Policy Guard", res8.status === 400, res8.status, 400);

  // ---------------------------------------------------------
  // 9. Recruiter Result Submission (201, PENDING_TPO_CONFIRMATION)
  // ---------------------------------------------------------
  const res9 = await fetch(`${baseUrl}/results/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter2}` },
    body: JSON.stringify({ applicationId: student1App.id, offeredPackage: 14.0, offerType: "FTE" }),
  });
  const body9 = await res9.json();
  record(9, "Recruiter Result Submission Queue", res9.status === 201 && body9.placementRecord?.status === "PENDING_TPO_CONFIRMATION", res9.status, 201);

  // ---------------------------------------------------------
  // 10. Official TPO Offer Confirmation (200, User -> PLACED)
  // ---------------------------------------------------------
  const recordId = body9.placementRecord?.id;
  const res10 = await fetch(`${baseUrl}/results/${recordId}/confirm`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenTpo}` },
  });
  const refreshedStudent = await User.findByPk(student1.id);
  record(10, "Official TPO Offer Confirmation", res10.status === 200 && refreshedStudent.placementStatus === "PLACED", res10.status, 200);

  // ---------------------------------------------------------
  // 11. Application After Deadline (400)
  // ---------------------------------------------------------
  const res11 = await fetch(`${baseUrl}/application/apply/${expiredDeadlineDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
    body: JSON.stringify({ coverLetter: "Expired" }),
  });
  record(11, "Application After Deadline Guard", res11.status === 400, res11.status, 400);

  // ---------------------------------------------------------
  // 12. Application to DRAFT Drive (400)
  // ---------------------------------------------------------
  const res12 = await fetch(`${baseUrl}/application/apply/${draftDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
    body: JSON.stringify({ coverLetter: "Draft" }),
  });
  record(12, "Application to DRAFT Drive Guard", res12.status === 400, res12.status, 400);

  // ---------------------------------------------------------
  // 13. Application to REJECTED Drive (400)
  // ---------------------------------------------------------
  const res13 = await fetch(`${baseUrl}/application/apply/${rejectedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
    body: JSON.stringify({ coverLetter: "Rejected" }),
  });
  record(13, "Application to REJECTED Drive Guard", res13.status === 400, res13.status, 400);

  // ---------------------------------------------------------
  // 14. Application to CLOSED Drive (400)
  // ---------------------------------------------------------
  const res14 = await fetch(`${baseUrl}/application/apply/${closedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
    body: JSON.stringify({ coverLetter: "Closed" }),
  });
  record(14, "Application to CLOSED Drive Guard", res14.status === 400, res14.status, 400);

  // ---------------------------------------------------------
  // 15. Application to COMPLETED Drive (400)
  // ---------------------------------------------------------
  const res15 = await fetch(`${baseUrl}/application/apply/${completedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
    body: JSON.stringify({ coverLetter: "Completed" }),
  });
  record(15, "Application to COMPLETED Drive Guard", res15.status === 400, res15.status, 400);

  // ---------------------------------------------------------
  // 16. OPTED_OUT Student Application (400)
  // ---------------------------------------------------------
  const res16 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenOptedOut}` },
    body: JSON.stringify({ coverLetter: "Opted out" }),
  });
  record(16, "OPTED_OUT Student Application Guard", res16.status === 400, res16.status, 400);

  // ---------------------------------------------------------
  // 17. Missing JWT Authentication (401)
  // ---------------------------------------------------------
  const res17 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coverLetter: "No auth" }),
  });
  record(17, "Missing JWT Authentication Guard", res17.status === 401, res17.status, 401);

  // ---------------------------------------------------------
  // 18. Invalid JWT Token Authentication (401)
  // ---------------------------------------------------------
  const res18 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer INVALID_FORGED_TOKEN_XYZ" },
    body: JSON.stringify({ coverLetter: "Invalid token" }),
  });
  record(18, "Invalid JWT Token Authentication Guard", res18.status === 401, res18.status, 401);

  // ---------------------------------------------------------
  // 19. Recruiter Submitting Result for Foreign Company Drive (403)
  // ---------------------------------------------------------
  const res19 = await fetch(`${baseUrl}/results/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter1}` },
    body: JSON.stringify({ applicationId: student1App.id, offeredPackage: 15.0 }),
  });
  record(19, "Recruiter Result Cross-Company Isolation", res19.status === 403, res19.status, 403);

  // ---------------------------------------------------------
  // 20. Duplicate TPO Confirmation Guard (400)
  // ---------------------------------------------------------
  const res20 = await fetch(`${baseUrl}/results/${recordId}/confirm`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenTpo}` },
  });
  record(20, "Duplicate TPO Confirmation Guard", res20.status === 400, res20.status, 400);

  // ---------------------------------------------------------
  // 21. Concurrent Duplicate Applications (409)
  // ---------------------------------------------------------
  await Application.destroy({ where: { jobId: publishedDrive.id, applicantId: student2.id } });
  const [cRes1, cRes2] = await Promise.all([
    fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
      body: JSON.stringify({ coverLetter: "Concurrent 1" }),
    }),
    fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` },
      body: JSON.stringify({ coverLetter: "Concurrent 2" }),
    }),
  ]);
  const concurrentStatuses = [cRes1.status, cRes2.status].sort();
  const concurrentPassed = concurrentStatuses[0] === 201 && concurrentStatuses[1] === 409;
  record(21, "Concurrent Duplicate Applications Guard", concurrentPassed, `${cRes1.status}, ${cRes2.status}`, "201, 409");

  // ---------------------------------------------------------
  // 22. Invalid Company Status Transition (Re-approving already approved company -> 400)
  // ---------------------------------------------------------
  const res22 = await fetch(`${baseUrl}/company/${approvedCompany.id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenTpo}` },
  });
  record(22, "Invalid Company Status Transition Guard", res22.status === 400, res22.status, 400);

  // ---------------------------------------------------------
  // 23. Direct MySQL Unique Constraint on applications (jobId, applicantId)
  // ---------------------------------------------------------
  let dbConstraintPassed = false;
  try {
    await sequelize.query(
      `INSERT INTO applications (jobId, applicantId, status, createdAt, updatedAt) VALUES (${publishedDrive.id}, ${student1.id}, 'APPLIED', NOW(), NOW())`
    );
  } catch (dbErr) {
    if (dbErr.name === "SequelizeUniqueConstraintError" || dbErr.original?.code === "ER_DUP_ENTRY" || String(dbErr.message).includes("UNIQUE constraint failed")) {
      dbConstraintPassed = true;
    }
  }
  record(23, "MySQL Unique Index on applications (jobId, applicantId)", dbConstraintPassed, dbConstraintPassed ? "ER_DUP_ENTRY" : "ERROR", "ER_DUP_ENTRY");

  // ---------------------------------------------------------
  // 24. Drive State Machine Invalid Transition Guard (PUBLISH unapproved drive -> 400)
  // ---------------------------------------------------------
  const res24 = await fetch(`${baseUrl}/job/${draftDrive.id}/publish`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenTpo}` },
  });
  record(24, "Drive State Machine Transition Guard", res24.status === 400, res24.status, 400);

  server.close();

  console.log("\n=========================================================================");
  console.log("📊 EXPANDED REAL HTTP INTEGRATION TEST RESULTS SUMMARY");
  console.log("=========================================================================");
  const passedCount = testResults.filter((t) => t.status === "PASS").length;
  console.log(`🎉 TEST SUMMARY: ${passedCount} / ${testResults.length} CRITICAL TESTS PASSED!`);
  console.log("=========================================================================");

  process.exit(passedCount === testResults.length ? 0 : 1);
};

runComprehensiveIntegrationTests().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
