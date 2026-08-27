import { PlacementRecord, Application, User, Job, Company, Notification } from "../models/index.js";
import { sequelize } from "../config/database.js";
import { logAuditTrail } from "../utils/auditLogger.js";
import { Op } from "sequelize";

/**
 * Recruiter: Submit Candidate Final Result (Pending TPO Confirmation)
 */
export const submitResult = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { applicationId, offeredPackage, offerType, offerLetterUrl } = req.body;

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Job, as: "job", include: [{ model: Company, as: "company" }] },
        { model: User, as: "applicant" },
      ],
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({ message: "Application not found", success: false });
    }

    // Recruiter cross-company ownership check
    if (req.user.role === "recruiter" && application.job?.createdById !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: "Forbidden - You cannot submit results for another company's drive", success: false });
    }

    // Check if an offer is already confirmed for this drive & candidate
    const existingRecord = await PlacementRecord.findOne({
      where: {
        studentId: application.applicantId,
        driveId: application.jobId,
      },
      transaction,
    });

    if (existingRecord && existingRecord.status === "CONFIRMED_PLACED") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Placement offer for this candidate has already been confirmed by TPO and cannot be modified.",
        success: false,
      });
    }

    const pkg = parseFloat(offeredPackage || application.job?.salary || 0);

    const [record, created] = await PlacementRecord.findOrCreate({
      where: {
        studentId: application.applicantId,
        driveId: application.jobId,
      },
      defaults: {
        companyId: application.job?.companyId,
        companyName: application.job?.company?.name || "Campus Recruiter",
        offeredPackage: pkg,
        offerType: offerType || "FTE",
        status: "PENDING_TPO_CONFIRMATION",
        offerLetterUrl: offerLetterUrl || "",
      },
      transaction,
    });

    if (!created) {
      record.offeredPackage = pkg;
      record.offerType = offerType || "FTE";
      record.status = "PENDING_TPO_CONFIRMATION";
      if (offerLetterUrl) record.offerLetterUrl = offerLetterUrl;
      await record.save({ transaction });
    }

    await transaction.commit();

    await logAuditTrail({
      userId: req.id,
      action: "PLACEMENT_RESULT_SUBMITTED",
      entity: "PlacementRecord",
      entityId: record.id,
      newValue: { status: "PENDING_TPO_CONFIRMATION", offeredPackage: pkg },
      req,
    });

    return res.status(201).json({
      message: `Candidate outcome for ${application.applicant?.fullName} submitted! It is currently PENDING TPO CONFIRMATION.`,
      success: true,
      placementRecord: record,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        // Ignored
      }
    }
    console.error("Submit Result Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Confirm Final Placement Offer (Atomically Wrapped in DB Transaction)
 */
export const confirmResult = async (req, res) => {
  if (req.user.role !== "tpo_admin") {
    return res.status(403).json({ message: "Forbidden - Only TPO Admin can confirm official placement records", success: false });
  }

  const recordId = req.params.id;
  const transaction = await sequelize.transaction();

  try {
    const record = await PlacementRecord.findByPk(recordId, {
      include: [
        { model: User, as: "student" },
        { model: Job, as: "drive" },
        { model: Company, as: "company" },
      ],
      transaction,
    });

    if (!record) {
      await transaction.rollback();
      return res.status(404).json({ message: "Placement record not found", success: false });
    }

    // Guard against duplicate TPO confirmations
    if (record.status === "CONFIRMED_PLACED") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Placement offer has already been confirmed by TPO.",
        success: false,
        placementRecord: record,
      });
    }

    // 1. Update PlacementRecord atomically
    record.status = "CONFIRMED_PLACED";
    record.confirmedById = req.id;
    record.confirmedAt = new Date();
    await record.save({ transaction });

    // 2. Update Student User placementStatus & CTC package atomically
    const student = await User.findByPk(record.studentId, { transaction });
    if (student) {
      const currentPlacementStatus = student.placementStatus;
      student.placementStatus = (currentPlacementStatus === "PLACED" || currentPlacementStatus === "MULTIPLE_OFFERS")
        ? "MULTIPLE_OFFERS"
        : "PLACED";

      const currentPkg = parseFloat(student.currentPackage || 0);
      const newPkg = parseFloat(record.offeredPackage);
      if (newPkg > currentPkg) {
        student.currentPackage = newPkg;
        student.placedCompanyName = record.company?.name || record.companyName;
      }
      student.placedDate = new Date();
      await student.save({ transaction });
    }

    // 3. Create Notification atomically
    await Notification.create(
      {
        userId: record.studentId,
        title: "🎉 Congratulations! Official Placement Offer Confirmed",
        message: `Your placement offer at ${record.companyName} (${record.offeredPackage} LPA) has been officially CONFIRMED by the TPO Office!`,
        type: "placement_confirmed",
        link: "/profile",
      },
      { transaction }
    );

    // Commit all changes atomically
    await transaction.commit();

    await logAuditTrail({
      userId: req.id,
      action: "PLACEMENT_OFFER_CONFIRMED_BY_TPO",
      entity: "PlacementRecord",
      entityId: record.id,
      newValue: { status: "CONFIRMED_PLACED", studentId: record.studentId, package: record.offeredPackage },
      req,
    });

    return res.status(200).json({
      message: `Official placement offer for ${record.student?.fullName || "student"} has been CONFIRMED by TPO!`,
      success: true,
      placementRecord: record,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        // Ignored
      }
    }
    console.error("Confirm Result Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Reject / Revoke Placement Result
 */
export const rejectResult = async (req, res) => {
  if (req.user.role !== "tpo_admin") {
    return res.status(403).json({ message: "Forbidden - Only TPO Admin can reject placement records", success: false });
  }

  const recordId = req.params.id;
  const { rejectionReason } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const record = await PlacementRecord.findByPk(recordId, {
      include: [
        { model: User, as: "student" },
        { model: Job, as: "drive" },
      ],
      transaction,
    });

    if (!record) {
      await transaction.rollback();
      return res.status(404).json({ message: "Placement record not found", success: false });
    }

    const wasConfirmed = record.status === "CONFIRMED_PLACED";
    record.status = "REJECTED";
    record.rejectionReason = rejectionReason || "Placement offer rejected by institutional policy.";
    await record.save({ transaction });

    // If it was previously confirmed, recompute student placementStatus & currentPackage
    if (wasConfirmed) {
      const student = await User.findByPk(record.studentId, { transaction });
      if (student) {
        const remainingConfirmed = await PlacementRecord.findAll({
          where: {
            studentId: record.studentId,
            status: "CONFIRMED_PLACED",
            id: { [Op.ne]: record.id },
          },
          include: [{ model: Company, as: "company" }],
          order: [["offeredPackage", "DESC"]],
          transaction,
        });

        if (remainingConfirmed.length > 0) {
          student.placementStatus = remainingConfirmed.length > 1 ? "MULTIPLE_OFFERS" : "PLACED";
          student.currentPackage = parseFloat(remainingConfirmed[0].offeredPackage);
          student.placedCompanyName = remainingConfirmed[0].company?.name || remainingConfirmed[0].companyName;
        } else {
          student.placementStatus = "NOT_PLACED";
          student.currentPackage = 0.00;
          student.placedCompanyName = null;
          student.placedDate = null;
        }
        await student.save({ transaction });
      }
    }

    await transaction.commit();

    await logAuditTrail({
      userId: req.id,
      action: "PLACEMENT_OFFER_REJECTED_BY_TPO",
      entity: "PlacementRecord",
      entityId: record.id,
      newValue: { status: "REJECTED", reason: record.rejectionReason },
      req,
    });

    return res.status(200).json({
      message: "Placement record rejected and student aggregate placement status updated.",
      success: true,
      placementRecord: record,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rbErr) {}
    }
    console.error("Reject Result Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Get All / Pending Placement Records
 */
export const getResults = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = {};
    if (userRole === "student") {
      whereClause = { studentId: userId };
    }

    const records = await PlacementRecord.findAll({
      where: whereClause,
      include: [
        { model: User, as: "student", attributes: ["id", "fullName", "email", "branch", "cgpa", "batchYear"] },
        { model: Job, as: "drive", attributes: ["id", "title", "salary", "location"] },
        { model: Company, as: "company", attributes: ["id", "name", "logo", "website", "industry", "location"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
