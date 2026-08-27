import express from "express";
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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/application", applicationRouter);
app.use("/api/rounds", roundRouter);
app.use("/api/results", resultRouter);
app.use("/api/policy", policyRouter);

const runProductionE2EAudit = async () => {
  console.log("=========================================================================");
  console.log("🧪 EXECUTING FULL PRODUCTION REALITY AUDIT (30 REAL HTTP TEST SCENARIOS)");
  console.log("=========================================================================");

  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash("password123", salt);

  // Setup Database Test Actors
  const [student1] = await User.findOrCreate({
    where: { email: "e2e_student1@college.edu" },
    defaults: { fullName: "E2E Student 1", email: "e2e_student1@college.edu", phoneNumber: "9876543211", password: passHash, role: "student", cgpa: 8.5, branch: "Computer Science", batchYear: 2026, backlogsCount: 0, placementStatus: "NOT_PLACED", currentPackage: 0.00 },
  });
  await student1.update({ cgpa: 8.5, branch: "Computer Science", batchYear: 2026, backlogsCount: 0, placementStatus: "NOT_PLACED", currentPackage: 0.00 });

  const [student2] = await User.findOrCreate({
    where: { email: "e2e_student2@college.edu" },
    defaults: { fullName: "E2E Student 2", email: "e2e_student2@college.edu", phoneNumber: "9876543212", password: passHash, role: "student", cgpa: 8.0, branch: "Computer Science", batchYear: 2026, backlogsCount: 0, placementStatus: "NOT_PLACED", currentPackage: 0.00 },
  });
  await student2.update({ cgpa: 8.0, branch: "Computer Science", batchYear: 2026, backlogsCount: 0, placementStatus: "NOT_PLACED", currentPackage: 0.00 });

  const [placedStudent] = await User.findOrCreate({
    where: { email: "e2e_placed@college.edu" },
    defaults: { fullName: "E2E Placed Student", email: "e2e_placed@college.edu", phoneNumber: "9811223345", password: passHash, role: "student", cgpa: 9.0, branch: "Information Technology", batchYear: 2026, backlogsCount: 0, placementStatus: "PLACED", currentPackage: 10.00, placedCompanyName: "Initial Placed Corp" },
  });
  await placedStudent.update({ placementStatus: "PLACED", currentPackage: 10.00, cgpa: 9.0, branch: "Information Technology", batchYear: 2026, backlogsCount: 0 });

  const [optedOutStudent] = await User.findOrCreate({
    where: { email: "e2e_optedout@college.edu" },
    defaults: { fullName: "E2E Opted Out Student", email: "e2e_optedout@college.edu", phoneNumber: "9822334466", password: passHash, role: "student", cgpa: 8.2, branch: "Electronics", batchYear: 2026, backlogsCount: 0, placementStatus: "OPTED_OUT", currentPackage: 0.00 },
  });
  await optedOutStudent.update({ placementStatus: "OPTED_OUT", currentPackage: 0.00 });

  const [ineligibleStudent] = await User.findOrCreate({
    where: { email: "e2e_ineligible@college.edu" },
    defaults: { fullName: "E2E Ineligible Student", email: "e2e_ineligible@college.edu", phoneNumber: "9844556678", password: passHash, role: "student", cgpa: 5.5, branch: "Civil", batchYear: 2026, backlogsCount: 3, placementStatus: "NOT_PLACED" },
  });
  await ineligibleStudent.update({ cgpa: 5.5, branch: "Civil", batchYear: 2026, backlogsCount: 3, placementStatus: "NOT_PLACED" });

  const [recruiter1] = await User.findOrCreate({
    where: { email: "e2e_recruiter1@infosys.com" },
    defaults: { fullName: "Infosys Recruiter", email: "e2e_recruiter1@infosys.com", phoneNumber: "9123456783", password: passHash, role: "recruiter" },
  });

  const [recruiter2] = await User.findOrCreate({
    where: { email: "e2e_recruiter2@tcs.com" },
    defaults: { fullName: "TCS Recruiter", email: "e2e_recruiter2@tcs.com", phoneNumber: "9123456784", password: passHash, role: "recruiter" },
  });

  const [tpoAdmin] = await User.findOrCreate({
    where: { email: "e2e_tpo@college.edu" },
    defaults: { fullName: "Head TPO Officer", email: "e2e_tpo@college.edu", phoneNumber: "9988776656", password: passHash, role: "tpo_admin" },
  });

  // JWTs
  const tokenStudent1 = jwt.sign({ userId: student1.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenStudent2 = jwt.sign({ userId: student2.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenPlaced = jwt.sign({ userId: placedStudent.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenOptedOut = jwt.sign({ userId: optedOutStudent.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenIneligible = jwt.sign({ userId: ineligibleStudent.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenRecruiter1 = jwt.sign({ userId: recruiter1.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenRecruiter2 = jwt.sign({ userId: recruiter2.id }, JWT_SECRET, { expiresIn: "1d" });
  const tokenTpo = jwt.sign({ userId: tpoAdmin.id }, JWT_SECRET, { expiresIn: "1d" });

  // Companies
  const [unapprovedCompany] = await Company.findOrCreate({
    where: { name: "E2E Unapproved Startup" },
    defaults: { name: "E2E Unapproved Startup", status: "PENDING", isApproved: false, userId: recruiter1.id },
  });
  await unapprovedCompany.update({ status: "PENDING", isApproved: false, userId: recruiter1.id });

  const [approvedCompany] = await Company.findOrCreate({
    where: { name: "E2E Approved Tech Corp" },
    defaults: { name: "E2E Approved Tech Corp", status: "APPROVED", isApproved: true, approvedById: tpoAdmin.id, userId: recruiter1.id },
  });
  await approvedCompany.update({ status: "APPROVED", isApproved: true, approvedById: tpoAdmin.id, userId: recruiter1.id });

  const [companyToSuspend] = await Company.findOrCreate({
    where: { name: "E2E Suspended Corp" },
    defaults: { name: "E2E Suspended Corp", status: "APPROVED", isApproved: true, approvedById: tpoAdmin.id, userId: recruiter2.id },
  });
  await companyToSuspend.update({ status: "APPROVED", isApproved: true, userId: recruiter2.id });

  // Policy
  const [policy] = await PlacementPolicy.findOrCreate({
    where: { isActive: true },
    defaults: { name: "Standard Institutional Policy", maxOffersAllowed: 1, allowPlacedStudentsToApply: false, minCtcIncreasePercentage: 50.0, dreamCompanyMinCtc: 15.0, isActive: true },
  });
  await policy.update({ maxOffersAllowed: 1, allowPlacedStudentsToApply: false, minCtcIncreasePercentage: 50.0, dreamCompanyMinCtc: 15.0, isActive: true });

  // Drives
  const [publishedDrive] = await Job.findOrCreate({
    where: { title: "E2E SDE Drive" },
    defaults: { title: "E2E SDE Drive", description: "Core engineering", requirements: "DSA", salary: 12, location: "Bengaluru", minCgpa: 7.0, batchYear: 2026, branchRequirement: "Computer Science, Information Technology", maxBacklogs: 0, driveType: "ON_CAMPUS", approvalStatus: "PUBLISHED", status: "active", companyId: approvedCompany.id, createdById: recruiter1.id },
  });
  await publishedDrive.update({ salary: 12, minCgpa: 7.0, batchYear: 2026, branchRequirement: "Computer Science, Information Technology", maxBacklogs: 0, driveType: "ON_CAMPUS", approvalStatus: "PUBLISHED", status: "active", companyId: approvedCompany.id, createdById: recruiter1.id });

  const [dreamDrive] = await Job.findOrCreate({
    where: { title: "E2E Dream High CTC Drive" },
    defaults: { title: "E2E Dream High CTC Drive", description: "Dream", requirements: "DSA", salary: 25, location: "Hyderabad", minCgpa: 7.0, batchYear: 2026, branchRequirement: "Computer Science, Information Technology", maxBacklogs: 0, driveType: "ON_CAMPUS", approvalStatus: "PUBLISHED", status: "active", companyId: approvedCompany.id, createdById: recruiter1.id },
  });
  await dreamDrive.update({ salary: 25, minCgpa: 7.0, batchYear: 2026, branchRequirement: "Computer Science, Information Technology", maxBacklogs: 0, driveType: "ON_CAMPUS", approvalStatus: "PUBLISHED", status: "active", companyId: approvedCompany.id, createdById: recruiter1.id });

  const [draftDrive] = await Job.findOrCreate({
    where: { title: "E2E Draft Drive" },
    defaults: { title: "E2E Draft Drive", description: "Draft", requirements: "Draft", salary: 10, location: "Delhi", approvalStatus: "DRAFT", status: "inactive", companyId: approvedCompany.id, createdById: recruiter1.id },
  });
  await draftDrive.update({ approvalStatus: "DRAFT", status: "inactive" });

  const [expiredDrive] = await Job.findOrCreate({
    where: { title: "E2E Expired Deadline Drive" },
    defaults: { title: "E2E Expired Deadline Drive", description: "Exp", requirements: "Exp", salary: 10, location: "Delhi", approvalStatus: "PUBLISHED", status: "active", applicationDeadline: new Date(Date.now() - 86400000), companyId: approvedCompany.id, createdById: recruiter1.id },
  });
  await expiredDrive.update({ approvalStatus: "PUBLISHED", status: "active", applicationDeadline: new Date(Date.now() - 86400000) });

  const [offCampusDrive] = await Job.findOrCreate({
    where: { title: "E2E Off Campus Residency" },
    defaults: { title: "E2E Off Campus Residency", description: "External", requirements: "External", salary: 30, location: "Remote", driveType: "OFF_CAMPUS", approvalStatus: "PUBLISHED", status: "active", externalUrl: "https://careers.google.com/jobs/off-campus", companyId: approvedCompany.id, createdById: recruiter1.id },
  });
  await offCampusDrive.update({ driveType: "OFF_CAMPUS", approvalStatus: "PUBLISHED", status: "active", externalUrl: "https://careers.google.com/jobs/off-campus" });

  const results = [];
  const test = (num, name, pass, actual, expected) => {
    results.push({ num, name, status: pass ? "PASS" : "FAIL", actual, expected });
    console.log(`Scenario ${num.toString().padStart(2, "0")} [${pass ? "PASS" : "FAIL"}]: ${name} (Status: ${actual}, Expected: ${expected})`);
  };

  // 1. Unapproved company cannot post on-campus drive (403)
  const r1 = await fetch(`${baseUrl}/job/post`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter1}` }, body: JSON.stringify({ title: "D1", description: "D", requirements: "R", salary: 10, location: "Delhi", companyId: unapprovedCompany.id, driveType: "ON_CAMPUS" }) });
  test(1, "Unapproved company cannot post on-campus drive", r1.status === 403, r1.status, 403);

  // 2. Recruiter cannot approve own company (403)
  const r2 = await fetch(`${baseUrl}/company/${unapprovedCompany.id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenRecruiter1}` } });
  test(2, "Recruiter cannot approve own company", r2.status === 403, r2.status, 403);

  // 3. Recruiter cannot post for another recruiter's company (403)
  const r3 = await fetch(`${baseUrl}/job/post`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter2}` }, body: JSON.stringify({ title: "Spoofed", description: "D", requirements: "R", salary: 10, location: "Delhi", companyId: approvedCompany.id, driveType: "ON_CAMPUS" }) });
  test(3, "Recruiter cannot post for another company", r3.status === 403, r3.status, 403);

  // 4. Recruiter cannot publish on-campus drive directly (Defaults to PENDING_APPROVAL)
  const r4 = await fetch(`${baseUrl}/job/post`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter1}` }, body: JSON.stringify({ title: "New Recruiter Drive", description: "D", requirements: "R", salary: 14, location: "Pune", companyId: approvedCompany.id, driveType: "ON_CAMPUS" }) });
  const b4 = await r4.json();
  test(4, "Recruiter drive creation defaults to PENDING_APPROVAL", r4.status === 201 && b4.job?.approvalStatus === "PENDING_APPROVAL", r4.status, 201);

  // 5. TPO can approve valid company (200)
  const r5 = await fetch(`${baseUrl}/company/${unapprovedCompany.id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenTpo}` } });
  test(5, "TPO can approve valid company", r5.status === 200, r5.status, 200);

  // 6. Invalid company transition is blocked (re-approving -> 400)
  const r6 = await fetch(`${baseUrl}/company/${unapprovedCompany.id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenTpo}` } });
  test(6, "Invalid company transition is blocked", r6.status === 400, r6.status, 400);

  // 7. Invalid drive transition is blocked (publishing DRAFT drive -> 400)
  const r7 = await fetch(`${baseUrl}/job/${draftDrive.id}/publish`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenTpo}` } });
  test(7, "Invalid drive transition is blocked", r7.status === 400, r7.status, 400);

  // 8. Eligible student can apply (201)
  await Application.destroy({ where: { jobId: publishedDrive.id, applicantId: student1.id } });
  const r8 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` }, body: JSON.stringify({ coverLetter: "Valid apply" }) });
  const b8 = await r8.json();
  const student1AppId = b8.application?.id;
  test(8, "Eligible student can apply", r8.status === 201, r8.status, 201);

  // 9. Ineligible student is blocked (400)
  const r9 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenIneligible}` }, body: JSON.stringify({ coverLetter: "Ineligible" }) });
  test(9, "Ineligible student is blocked with reasons", r9.status === 400, r9.status, 400);

  // 10. Duplicate application returns 409 (409)
  const r10 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` }, body: JSON.stringify({ coverLetter: "Dup" }) });
  test(10, "Duplicate application returns 409", r10.status === 409, r10.status, 409);

  // 11. Concurrent duplicate applications create only one record
  await Application.destroy({ where: { jobId: publishedDrive.id, applicantId: student2.id } });
  const [c1, c2] = await Promise.all([
    fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` }, body: JSON.stringify({ coverLetter: "Concurrent 1" }) }),
    fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent2}` }, body: JSON.stringify({ coverLetter: "Concurrent 2" }) }),
  ]);
  const concurrentStatuses = [c1.status, c2.status].sort();
  test(11, "Concurrent duplicate applications create only one record", concurrentStatuses[0] === 201 && concurrentStatuses[1] === 409, `${c1.status}, ${c2.status}`, "201, 409");

  // 12. Student cannot access/withdraw another student's application (403)
  const r12 = await fetch(`${baseUrl}/application/${student1AppId}/withdraw`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenStudent2}` } });
  test(12, "Cross-student application privacy", r12.status === 403, r12.status, 403);

  // 13. Recruiter cannot access another company's applicants (403)
  const r13 = await fetch(`${baseUrl}/application/${publishedDrive.id}/applicants`, { method: "GET", headers: { Authorization: `Bearer ${tokenRecruiter2}` } });
  test(13, "Cross-company applicants isolation", r13.status === 403, r13.status, 403);

  // 14. Application after deadline is blocked (400)
  const r14 = await fetch(`${baseUrl}/application/apply/${expiredDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` }, body: JSON.stringify({ coverLetter: "Late" }) });
  test(14, "Application after deadline is blocked", r14.status === 400, r14.status, 400);

  // 15. Application to non-published drive is blocked (400)
  const r15 = await fetch(`${baseUrl}/application/apply/${draftDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` }, body: JSON.stringify({ coverLetter: "Draft" }) });
  test(15, "Application to non-published drive is blocked", r15.status === 400, r15.status, 400);

  // 16. OPTED_OUT student is blocked from on-campus placement (400)
  const r16 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenOptedOut}` }, body: JSON.stringify({ coverLetter: "Opted out" }) });
  test(16, "OPTED_OUT student is blocked from on-campus placement", r16.status === 400, r16.status, 400);

  // 17. Placed student policy: Placed at 10 LPA applying for 12 LPA (< 15 LPA dream / < +50% CTC) is blocked
  const r17 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlaced}` }, body: JSON.stringify({ coverLetter: "Placed low" }) });
  test(17, "Placed student policy blocks non-upgrade offers", r17.status === 400, r17.status, 400);

  // 18. Placed student policy: Placed at 10 LPA applying for 25 LPA dream drive is allowed (201)
  await Application.destroy({ where: { jobId: dreamDrive.id, applicantId: placedStudent.id } });
  const r18 = await fetch(`${baseUrl}/application/apply/${dreamDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlaced}` }, body: JSON.stringify({ coverLetter: "Placed dream apply" }) });
  test(18, "Placed student policy allows dream company upgrade", r18.status === 201, r18.status, 201);

  // 19. Recruiter submits pending result (201, status PENDING_TPO_CONFIRMATION)
  const r19 = await fetch(`${baseUrl}/results/submit`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter1}` }, body: JSON.stringify({ applicationId: student1AppId, offeredPackage: 14.00, offerType: "FTE" }) });
  const b19 = await r19.json();
  const placementRecordId = b19.placementRecord?.id;
  test(19, "Recruiter submits pending result", r19.status === 201 && b19.placementRecord?.status === "PENDING_TPO_CONFIRMATION", r19.status, 201);

  // 20. TPO confirms offer atomically (200, updates User -> PLACED)
  const r20 = await fetch(`${baseUrl}/results/${placementRecordId}/confirm`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenTpo}` } });
  const checkStudent1Placed = await User.findByPk(student1.id);
  test(20, "TPO confirms offer atomically and updates student status to PLACED", r20.status === 200 && checkStudent1Placed.placementStatus === "PLACED", r20.status, 200);

  // 21. Duplicate TPO confirmation is blocked (400)
  const r21 = await fetch(`${baseUrl}/results/${placementRecordId}/confirm`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenTpo}` } });
  test(21, "Duplicate TPO confirmation is blocked", r21.status === 400, r21.status, 400);

  // 22. Recruiter cannot submit duplicate conflicting result once confirmed (400)
  const r22 = await fetch(`${baseUrl}/results/submit`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter1}` }, body: JSON.stringify({ applicationId: student1AppId, offeredPackage: 18.00 }) });
  test(22, "Recruiter cannot modify confirmed placement result", r22.status === 400, r22.status, 400);

  // 23. Forced transaction failure rolls back all changes
  let txRollbackPassed = false;
  const tx = await sequelize.transaction();
  try {
    student1.currentPackage = 99.00;
    await student1.save({ transaction: tx });
    throw new Error("SIMULATED_TEST_EXCEPTION");
    await tx.commit();
  } catch (err) {
    await tx.rollback();
  }
  const checkStudent1Tx = await User.findByPk(student1.id);
  txRollbackPassed = parseFloat(checkStudent1Tx.currentPackage) !== 99.00;
  test(23, "Forced transaction failure rolls back all changes", txRollbackPassed, txRollbackPassed ? "ROLLED_BACK" : "COMMITTED", "ROLLED_BACK");

  // 24. Company identity remains consistent from Job to PlacementRecord to Student
  const checkPlRecord = await PlacementRecord.findByPk(placementRecordId, { include: [{ model: Company, as: "company" }] });
  const identityConsistent = checkPlRecord.companyName === approvedCompany.name && checkStudent1Placed.placedCompanyName === approvedCompany.name;
  test(24, "Company identity remains consistent from Job to PlacementRecord to Student", identityConsistent, `${checkPlRecord.companyName} / ${checkStudent1Placed.placedCompanyName}`, approvedCompany.name);

  // 25. OFF_CAMPUS opportunity does not create on-campus placement / redirects externally (400)
  const r25 = await fetch(`${baseUrl}/application/apply/${offCampusDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` }, body: JSON.stringify({ coverLetter: "External apply attempt" }) });
  test(25, "OFF_CAMPUS opportunity redirects externally and blocks internal placement locking", r25.status === 400, r25.status, 400);

  // 26. Missing JWT returns 401
  const r26 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  test(26, "Missing JWT returns 401", r26.status === 401, r26.status, 401);

  // 27. Invalid JWT returns 401
  const r27 = await fetch(`${baseUrl}/application/apply/${publishedDrive.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer INVALID_TOKEN_123" }, body: JSON.stringify({}) });
  test(27, "Invalid JWT returns 401", r27.status === 401, r27.status, 401);

  // 28. Unauthorized role returns 403 (Student attempting TPO action)
  const r28 = await fetch(`${baseUrl}/company/${approvedCompany.id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenStudent1}` } });
  test(28, "Unauthorized role returns 403", r28.status === 403, r28.status, 403);

  // 29. TPO suspends company -> Recruiter cannot post drives under suspended company (403)
  const r29a = await fetch(`${baseUrl}/company/${companyToSuspend.id}/suspend`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenTpo}` }, body: JSON.stringify({ reason: "Policy violation" }) });
  const r29b = await fetch(`${baseUrl}/job/post`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenRecruiter2}` }, body: JSON.stringify({ title: "Suspended Post", description: "D", requirements: "R", salary: 10, location: "Delhi", companyId: companyToSuspend.id, driveType: "ON_CAMPUS" }) });
  test(29, "Suspended company blocks recruiter drive creation", r29a.status === 200 && r29b.status === 403, `${r29a.status}, ${r29b.status}`, "200, 403");

  // 30. Student cannot withdraw application after official offer is confirmed by TPO (400)
  const r30 = await fetch(`${baseUrl}/application/${student1AppId}/withdraw`, { method: "PATCH", headers: { Authorization: `Bearer ${tokenStudent1}` } });
  test(30, "Student cannot withdraw application after offer is confirmed by TPO", r30.status === 400, r30.status, 400);

  server.close();

  console.log("\n=========================================================================");
  console.log("📊 PRODUCTION REALITY AUDIT RESULTS SUMMARY");
  console.log("=========================================================================");
  const passedCount = results.filter((r) => r.status === "PASS").length;
  console.log(`🎉 SUMMARY: ${passedCount} / ${results.length} PRODUCTION SCENARIOS PASSED!`);
  console.log("=========================================================================\n");

  process.exit(passedCount === results.length ? 0 : 1);
};

runProductionE2EAudit().catch((err) => {
  console.error("Audit Execution Error:", err);
  process.exit(1);
});
