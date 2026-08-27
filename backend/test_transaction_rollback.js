import { connectDB, sequelize } from "./config/database.js";
import { User, Company, Job, Application, PlacementRecord } from "./models/index.js";

const testTransactionRollback = async () => {
  console.log("=========================================================================");
  console.log("🧪 RUNNING TRANSACTION ATOMICITY & ROLLBACK FAILURE AUDIT TEST");
  console.log("=========================================================================");

  await connectDB();

  // Find or create test student
  const [student] = await User.findOrCreate({
    where: { email: "tx_student@test.com" },
    defaults: {
      fullName: "Tx Test Student",
      email: "tx_student@test.com",
      phoneNumber: "9876543299",
      password: "hash",
      role: "student",
      placementStatus: "NOT_PLACED",
      currentPackage: 0,
    },
  });
  await student.update({ placementStatus: "NOT_PLACED", currentPackage: 0 });

  const [company] = await Company.findOrCreate({
    where: { name: "Tx Test Company" },
    defaults: { name: "Tx Test Company", status: "APPROVED", isApproved: true, userId: student.id },
  });

  const [drive] = await Job.findOrCreate({
    where: { title: "Tx Test Drive" },
    defaults: {
      title: "Tx Test Drive",
      salary: 10,
      location: "Bangalore",
      description: "Test",
      requirements: "Test",
      driveType: "ON_CAMPUS",
      approvalStatus: "PUBLISHED",
      status: "active",
      companyId: company.id,
      createdById: student.id,
    },
  });

  const [record] = await PlacementRecord.findOrCreate({
    where: { studentId: student.id, driveId: drive.id },
    defaults: {
      companyId: company.id,
      companyName: company.name,
      offeredPackage: 20.0,
      status: "PENDING_TPO_CONFIRMATION",
    },
  });
  await record.update({ status: "PENDING_TPO_CONFIRMATION", offeredPackage: 20.0 });

  // Simulate failure in middle of multi-step placement confirmation
  console.log("[Simulation] Starting transaction: Step 1 (PlacementRecord update) -> Step 2 (Forced Exception before commit)");
  const tx = await sequelize.transaction();

  try {
    record.status = "CONFIRMED_PLACED";
    await record.save({ transaction: tx });

    student.placementStatus = "PLACED";
    student.currentPackage = 20.0;
    await student.save({ transaction: tx });

    // FORCED CRITICAL ERROR BEFORE COMMIT
    throw new Error("FORCED_SIMULATED_DB_ERROR_DURING_CONFIRMATION");

    await tx.commit();
  } catch (err) {
    console.log(`[Exception Caught]: ${err.message} — Rolling back transaction.`);
    await tx.rollback();
  }

  // Verify database state after rollback
  const checkRecord = await PlacementRecord.findByPk(record.id);
  const checkStudent = await User.findByPk(student.id);

  console.log(`PlacementRecord status in DB: ${checkRecord.status} (Expected: PENDING_TPO_CONFIRMATION)`);
  console.log(`User placementStatus in DB: ${checkStudent.placementStatus} (Expected: NOT_PLACED)`);
  console.log(`User currentPackage in DB: ${checkStudent.currentPackage} (Expected: 0)`);

  const isRollbackSuccessful =
    checkRecord.status === "PENDING_TPO_CONFIRMATION" &&
    checkStudent.placementStatus === "NOT_PLACED" &&
    checkStudent.currentPackage === 0;

  if (isRollbackSuccessful) {
    console.log("✅ TRANSACTION ATOMICITY AUDIT PASSED: All partial mutations rolled back cleanly with 0 data corruption.");
    process.exit(0);
  } else {
    console.error("❌ TRANSACTION ATOMICITY AUDIT FAILED: Partial data remained committed.");
    process.exit(1);
  }
};

testTransactionRollback().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
