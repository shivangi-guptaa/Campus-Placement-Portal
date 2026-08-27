import { sequelize } from "./config/database.js";
import { Company, Job, PlacementRecord, User } from "./models/index.js";

/**
 * Data Repair Script: Synchronize Company Identity & Fix Inconsistent/Vague Records
 */
export const repairCompanyIdentity = async () => {
  console.log("=========================================================================");
  console.log("🔧 STARTING COMPANY IDENTITY & RECORD SYNCHRONIZATION REPAIR");
  console.log("=========================================================================");

  await sequelize.authenticate();

  const report = {
    jobsRepaired: [],
    placementRecordsRepaired: [],
    usersRepaired: [],
  };

  // 1. Audit & Repair Job -> Company associations
  const allJobs = await Job.findAll({
    include: [{ model: Company, as: "company" }],
  });

  for (const job of allJobs) {
    if (!job.company) {
      console.warn(`[REPAIR WARNING] Job ID ${job.id} ('${job.title}') has invalid companyId ${job.companyId}.`);
      // Find fallback approved company
      const defaultComp = await Company.findOne({ where: { status: "APPROVED" } });
      if (defaultComp) {
        const oldCompanyId = job.companyId;
        job.companyId = defaultComp.id;
        await job.save();
        report.jobsRepaired.push({
          jobId: job.id,
          title: job.title,
          oldCompanyId,
          newCompanyId: defaultComp.id,
          companyName: defaultComp.name,
        });
      }
    }
  }

  // 2. Audit & Repair PlacementRecord -> Company synchronization
  const allRecords = await PlacementRecord.findAll({
    include: [
      { model: Job, as: "drive", include: [{ model: Company, as: "company" }] },
      { model: Company, as: "company" },
      { model: User, as: "student" },
    ],
  });

  for (const record of allRecords) {
    const canonicalCompany = record.drive?.company || record.company;
    let needsSave = false;
    const oldSnapshot = {
      recordId: record.id,
      studentName: record.student?.fullName || `Student #${record.studentId}`,
      oldCompanyId: record.companyId,
      oldCompanyName: record.companyName,
    };

    if (canonicalCompany) {
      if (record.companyId !== canonicalCompany.id) {
        record.companyId = canonicalCompany.id;
        needsSave = true;
      }
      if (record.companyName !== canonicalCompany.name) {
        record.companyName = canonicalCompany.name;
        needsSave = true;
      }
    }

    if (needsSave) {
      await record.save();
      report.placementRecordsRepaired.push({
        ...oldSnapshot,
        newCompanyId: record.companyId,
        newCompanyName: record.companyName,
      });
    }
  }

  // 3. Audit & Repair Placed Students -> placedCompanyName
  const placedStudents = await User.findAll({
    where: {
      placementStatus: ["PLACED", "MULTIPLE_OFFERS"],
    },
    include: [
      {
        model: PlacementRecord,
        as: "placementRecords",
        where: { status: "CONFIRMED_PLACED" },
        required: false,
        include: [{ model: Company, as: "company" }],
      },
    ],
  });

  for (const student of placedStudents) {
    const confirmedRecord = student.placementRecords?.[0];
    if (confirmedRecord) {
      const canonicalName = confirmedRecord.company?.name || confirmedRecord.companyName;
      if (canonicalName && student.placedCompanyName !== canonicalName) {
        const oldName = student.placedCompanyName;
        student.placedCompanyName = canonicalName;
        await student.save();
        report.usersRepaired.push({
          userId: student.id,
          studentName: student.fullName,
          oldPlacedCompanyName: oldName,
          newPlacedCompanyName: canonicalName,
        });
      }
    }
  }

  console.log("\n=========================================================================");
  console.log("📊 COMPANY IDENTITY DATA REPAIR SUMMARY");
  console.log("=========================================================================");
  console.log(`Jobs Repaired:             ${report.jobsRepaired.length}`);
  console.log(`Placement Records Repaired: ${report.placementRecordsRepaired.length}`);
  console.log(`Placed Students Repaired:  ${report.usersRepaired.length}`);

  if (report.placementRecordsRepaired.length > 0) {
    console.log("\nRepaired Placement Records:");
    console.table(report.placementRecordsRepaired);
  }
  if (report.usersRepaired.length > 0) {
    console.log("\nRepaired Placed Students:");
    console.table(report.usersRepaired);
  }
  console.log("=========================================================================\n");

  return report;
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("repair_company_identity.js")) {
  repairCompanyIdentity()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Repair Error:", err);
      process.exit(1);
    });
}
