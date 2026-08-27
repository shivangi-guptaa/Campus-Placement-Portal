import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB, sequelize } from "./config/database.js";
import { User, Company, Job, Application, PlacementRecord } from "./models/index.js";
import { JWT_SECRET } from "./config/jwtConfig.js";
import { repairCompanyIdentity } from "./repair_company_identity.js";

import jobRouter from "./routes/job.route.js";
import applicationRouter from "./routes/application.route.js";
import resultRouter from "./routes/result.route.js";
import companyRouter from "./routes/company.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/job", jobRouter);
app.use("/api/application", applicationRouter);
app.use("/api/results", resultRouter);
app.use("/api/company", companyRouter);

const runCompanyIdentityTests = async () => {
  console.log("=========================================================================");
  console.log("🏢 STARTING COMPANY IDENTITY & CONSISTENCY INTEGRATION TESTS (6 SCENARIOS)");
  console.log("=========================================================================");

  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash("password123", salt);

  // Setup Actors
  const [recruiterA] = await User.findOrCreate({
    where: { email: "recruiter_a@tcs.com" },
    defaults: { fullName: "TCS Recruiter", email: "recruiter_a@tcs.com", phoneNumber: "9876543211", password: passHash, role: "recruiter" },
  });

  const [recruiterB] = await User.findOrCreate({
    where: { email: "recruiter_b@infosys.com" },
    defaults: { fullName: "Infosys Recruiter", email: "recruiter_b@infosys.com", phoneNumber: "9876543212", password: passHash, role: "recruiter" },
  });

  const [student] = await User.findOrCreate({
    where: { email: "student_id_test@college.edu" },
    defaults: { fullName: "Identity Test Student", email: "student_id_test@college.edu", phoneNumber: "9876543213", password: passHash, role: "student", cgpa: 9.0, branch: "Computer Science", batchYear: 2026, placementStatus: "NOT_PLACED", currentPackage: 0.00 },
  });
  await student.update({ placementStatus: "NOT_PLACED", currentPackage: 0.00, cgpa: 9.0, branch: "Computer Science", batchYear: 2026 });

  const [tpoAdmin] = await User.findOrCreate({
    where: { email: "tpo_identity@college.edu" },
    defaults: { fullName: "TPO Officer", email: "tpo_identity@college.edu", phoneNumber: "9876543214", password: passHash, role: "tpo_admin" },
  });

  // Setup Companies
  const [companyA] = await Company.findOrCreate({
    where: { name: "Tata Consultancy Services Ltd" },
    defaults: { name: "Tata Consultancy Services Ltd", industry: "Information Technology", website: "https://www.tcs.com", status: "APPROVED", isApproved: true, userId: recruiterA.id },
  });
  await companyA.update({ status: "APPROVED", isApproved: true, userId: recruiterA.id });

  const [companyB] = await Company.findOrCreate({
    where: { name: "Infosys Limited" },
    defaults: { name: "Infosys Limited", industry: "Information Technology", website: "https://www.infosys.com", status: "APPROVED", isApproved: true, userId: recruiterB.id },
  });
  await companyB.update({ status: "APPROVED", isApproved: true, userId: recruiterB.id });

  const tokenRecruiterA = jwt.sign({ userId: recruiterA.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenRecruiterB = jwt.sign({ userId: recruiterB.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenStudent = jwt.sign({ userId: student.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenTpo = jwt.sign({ userId: tpoAdmin.id }, JWT_SECRET, { expiresIn: "1d" });

  const testResults = [];
  const recordResult = (num, name, pass, detail) => {
    testResults.push({ num, name, status: pass ? "PASS" : "FAIL", detail });
    console.log(`TEST ${num} [${pass ? "PASS" : "FAIL"}]: ${name} — ${detail}`);
  };

  // -------------------------------------------------------------
  // TEST 1: Recruiter creates drive for own company
  // -------------------------------------------------------------
  const res1 = await fetch(`${baseUrl}/job/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiterA}` },
    body: JSON.stringify({
      title: "TCS Digital Associate Developer",
      description: "Cloud and Big Data engineering",
      requirements: "Java and SQL",
      salary: 9,
      location: "Bengaluru",
      companyId: companyA.id,
      driveType: "ON_CAMPUS",
    }),
  });
  const body1 = await res1.json();
  const test1Pass = res1.status === 201 && body1.job?.companyId === companyA.id;
  recordResult(1, "Recruiter creates drive for own company", test1Pass, `Status: ${res1.status}, CompanyId: ${body1.job?.companyId}`);

  const createdDriveId = body1.job?.id;

  // -------------------------------------------------------------
  // TEST 2: Recruiter attempts to spoof another recruiter's companyId
  // -------------------------------------------------------------
  const res2 = await fetch(`${baseUrl}/job/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiterA}` },
    body: JSON.stringify({
      title: "Spoofed Drive",
      description: "Spoofed",
      requirements: "Spoofed",
      salary: 12,
      location: "Pune",
      companyId: companyB.id, // Recruiter A attempting to post for Company B
      driveType: "ON_CAMPUS",
    }),
  });
  const test2Pass = res2.status === 403;
  recordResult(2, "Recruiter cannot post for another company (Anti-Spoofing)", test2Pass, `Status: ${res2.status} (Expected 403)`);

  // Publish Drive 1 for testing
  await Job.update({ approvalStatus: "PUBLISHED", status: "active" }, { where: { id: createdDriveId } });

  // -------------------------------------------------------------
  // TEST 3: API returns drive with complete associated Company entity
  // -------------------------------------------------------------
  const res3 = await fetch(`${baseUrl}/job/get/${createdDriveId}`);
  const body3 = await res3.json();
  const returnedComp = body3.job?.company;
  const test3Pass = res3.status === 200 && returnedComp?.name === "Tata Consultancy Services Ltd" && returnedComp?.industry === "Information Technology";
  recordResult(3, "API returns drive with correct associated Company.name & metadata", test3Pass, `Company Name: '${returnedComp?.name}', Industry: '${returnedComp?.industry}'`);

  // -------------------------------------------------------------
  // TEST 4: PlacementRecord created from application derives canonical companyId
  // -------------------------------------------------------------
  // Student applies
  const resApply = await fetch(`${baseUrl}/application/apply/${createdDriveId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent}` },
    body: JSON.stringify({ coverLetter: "Application test" }),
  });
  const bodyApply = await resApply.json();
  const appId = bodyApply.application?.id;

  // Recruiter A submits outcome
  const res4 = await fetch(`${baseUrl}/results/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiterA}` },
    body: JSON.stringify({
      applicationId: appId,
      offeredPackage: 9.00,
      offerType: "FTE",
    }),
  });
  const body4 = await res4.json();
  const plRecord = body4.placementRecord;
  const test4Pass = res4.status === 201 && plRecord?.companyId === companyA.id && plRecord?.companyName === "Tata Consultancy Services Ltd";
  recordResult(4, "PlacementRecord derives canonical companyId & companyName from Job->Company", test4Pass, `Record CompanyId: ${plRecord?.companyId}, CompanyName: '${plRecord?.companyName}'`);

  // -------------------------------------------------------------
  // TEST 5: Placement confirmation updates student placementStatus & placedCompanyName
  // -------------------------------------------------------------
  const res5 = await fetch(`${baseUrl}/results/${plRecord.id}/confirm`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenTpo}` },
  });
  const refreshedStudent = await User.findByPk(student.id);
  const test5Pass = res5.status === 200 && refreshedStudent.placementStatus === "PLACED" && refreshedStudent.placedCompanyName === "Tata Consultancy Services Ltd";
  recordResult(5, "Official TPO confirmation synchronizes student canonical placedCompanyName", test5Pass, `Student PlacementStatus: ${refreshedStudent.placementStatus}, PlacedCompany: '${refreshedStudent.placedCompanyName}'`);

  // -------------------------------------------------------------
  // TEST 6: Inconsistent companyName record is safely repaired by repair script
  // -------------------------------------------------------------
  // Create an intentionally inconsistent placement record with old generic name
  const badRecord = await PlacementRecord.create({
    studentId: student.id,
    driveId: createdDriveId,
    companyId: companyA.id,
    companyName: "Generic Old Inconsistent Corp", // Outdated / Inconsistent
    offeredPackage: 9.00,
    status: "CONFIRMED_PLACED",
  });

  // Run repair
  const repairReport = await repairCompanyIdentity();
  const fixedRecord = await PlacementRecord.findByPk(badRecord.id);
  const test6Pass = fixedRecord.companyName === "Tata Consultancy Services Ltd" && fixedRecord.companyId === companyA.id;
  recordResult(6, "Data repair script safely synchronizes inconsistent company records", test6Pass, `Repaired Name: '${fixedRecord.companyName}' (was 'Generic Old Inconsistent Corp')`);

  await badRecord.destroy();
  server.close();

  console.log("\n=========================================================================");
  console.log("📊 COMPANY IDENTITY INTEGRATION TEST SUMMARY");
  console.log("=========================================================================");
  const passedCount = testResults.filter((t) => t.status === "PASS").length;
  console.log(`🎉 TEST SUMMARY: ${passedCount} / ${testResults.length} COMPANY IDENTITY TESTS PASSED!`);
  console.log("=========================================================================");

  process.exit(passedCount === testResults.length ? 0 : 1);
};

runCompanyIdentityTests().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
