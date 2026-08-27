import { sequelize } from "../config/database.js";
import { Application, Job, User, Company, Notification, Skill, ApplicationRound, PlacementRecord, PlacementPolicy } from "../models/index.js";
import { checkStudentEligibility } from "../services/eligibilityService.js";
import { logAuditTrail } from "../utils/auditLogger.js";

/**
 * Student: Apply to a Placement Drive
 */
export const applyJob = async (req, res) => {
  const userId = req.id;
  const jobId = req.params.id;
  const { coverLetter } = req.body;

  // Enforce student role
  if (req.user.role !== "student") {
    return res.status(403).json({
      message: "Forbidden - Only registered students can apply for campus placement drives.",
      success: false,
    });
  }

  const transaction = await sequelize.transaction();

  try {
    if (!jobId) {
      await transaction.rollback();
      return res.status(400).json({ message: "Placement Drive ID is required", success: false });
    }

    const job = await Job.findByPk(jobId, {
      include: [
        { model: Skill, as: "skills" },
        { model: Company, as: "company" },
      ],
      transaction,
    });

    if (!job) {
      await transaction.rollback();
      return res.status(404).json({ message: "Placement drive not found", success: false });
    }

    // Off-campus opportunities must be applied to via external career portal
    if (job.driveType === "OFF_CAMPUS") {
      await transaction.rollback();
      return res.status(400).json({
        message: "This is an off-campus opportunity. Please apply directly using the official external company application URL.",
        success: false,
        externalUrl: job.externalUrl,
      });
    }

    // Ensure drive is published & active
    if (job.approvalStatus !== "PUBLISHED" || job.status !== "active") {
      await transaction.rollback();
      return res.status(400).json({
        message: `This placement drive is currently ${job.approvalStatus || "inactive"} and not accepting applications.`,
        success: false,
      });
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Application deadline for this placement drive expired on ${new Date(job.applicationDeadline).toLocaleDateString()}.`,
        success: false,
      });
    }

    // Duplicate Application Check (409 Conflict)
    const existingApp = await Application.findOne({
      where: { jobId, applicantId: userId },
      transaction,
    });

    if (existingApp) {
      await transaction.rollback();
      return res.status(409).json({
        message: "Duplicate Application: You have already applied for this placement drive.",
        success: false,
        applicationId: existingApp.id,
        appliedAt: existingApp.appliedAt,
      });
    }

    const student = await User.findByPk(userId, {
      include: [{ model: Skill, as: "skills" }],
      transaction,
    });

    const policy = await PlacementPolicy.findOne({ where: { isActive: true }, transaction });

    // Strong Backend Eligibility & Placement Policy Verification
    const evalResult = await checkStudentEligibility(student, job, policy);

    if (!evalResult.eligible) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Eligibility Verification Failed: You do not meet the institutional criteria for this placement drive.",
        success: false,
        reasons: evalResult.reasons,
        checklist: evalResult.checklist,
      });
    }

    // Create Application with Standardized Status APPLIED
    const newApp = await Application.create(
      {
        jobId,
        applicantId: userId,
        status: "APPLIED",
        coverLetter: coverLetter || "",
      },
      { transaction }
    );

    // Seed Initial Round 1 (Aptitude / Screening)
    await ApplicationRound.create(
      {
        applicationId: newApp.id,
        roundNumber: 1,
        roundName: "Round 1: Online Assessment & Profile Screening",
        roundType: "APTITUDE",
        status: "PENDING",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      { transaction }
    );

    // Notify Recruiter
    await Notification.create(
      {
        userId: job.createdById,
        title: "New Candidate Application",
        message: `${student.fullName} (${student.branch}, CGPA: ${student.cgpa}) applied for drive: ${job.title}`,
        type: "application",
        link: `/admin/jobs/${job.id}/applicants`,
      },
      { transaction }
    );

    await transaction.commit();

    await logAuditTrail({
      userId,
      action: "APPLICATION_SUBMITTED",
      entity: "Application",
      entityId: newApp.id,
      newValue: { jobId, status: "APPLIED" },
      req,
    });

    return res.status(201).json({
      message: "Application submitted successfully! Your eligibility was verified and Round 1 has been scheduled.",
      success: true,
      application: newApp,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rbErr) {}
    }
    if (error.name === "SequelizeUniqueConstraintError" || error.original?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Duplicate Application: You have already applied for this placement drive.",
        success: false,
      });
    }
    console.error("Apply Job Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Student: View Own Applications with Rounds & Placement Records
 */
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const applications = await Application.findAll({
      where: { applicantId: userId },
      include: [
        {
          model: Job,
          as: "job",
          include: [{ model: Company, as: "company" }],
        },
        {
          model: ApplicationRound,
          as: "rounds",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Student: Withdraw Application
 */
export const withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.id;

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Job, as: "job" }],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found", success: false });
    }

    // Student privacy check (403 Forbidden)
    if (req.user.role === "student" && application.applicantId !== userId) {
      return res.status(403).json({
        message: "Forbidden - You cannot withdraw another student's application.",
        success: false,
      });
    }

    if (application.status === "WITHDRAWN") {
      return res.status(400).json({
        message: "Application is already withdrawn.",
        success: false,
      });
    }

    // Guard: Cannot withdraw if already confirmed placed by TPO
    const confirmedPlacement = await PlacementRecord.findOne({
      where: {
        driveId: application.jobId,
        studentId: application.applicantId,
        status: "CONFIRMED_PLACED",
      },
    });

    if (confirmedPlacement) {
      return res.status(400).json({
        message: "Cannot withdraw application after an official placement offer has been confirmed by TPO.",
        success: false,
      });
    }

    application.status = "WITHDRAWN";
    await application.save();

    await logAuditTrail({
      userId,
      action: "APPLICATION_WITHDRAWN",
      entity: "Application",
      entityId: application.id,
      newValue: { status: "WITHDRAWN" },
      req,
    });

    return res.status(200).json({
      message: `Your application for '${application.job?.title}' has been WITHDRAWN.`,
      success: true,
      application,
    });
  } catch (error) {
    console.error("Withdraw Application Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Recruiter & TPO: View Applicants for a Drive
 */
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;
    const userRole = req.user.role;

    const job = await Job.findByPk(jobId, {
      include: [
        { model: Company, as: "company" },
        {
          model: Application,
          as: "applications",
          include: [
            {
              model: User,
              as: "applicant",
              attributes: { exclude: ["password"] },
              include: [{ model: Skill, as: "skills" }],
            },
            {
              model: ApplicationRound,
              as: "rounds",
            },
          ],
        },
      ],
    });

    if (!job) return res.status(404).json({ message: "Placement drive not found", success: false });

    // Cross-company isolation (403 Forbidden)
    if (userRole === "recruiter") {
      if (job.createdById !== userId && job.company?.userId !== userId) {
        return res.status(403).json({
          message: "Forbidden - You do not have permission to view applicants for another company's placement drive.",
          success: false,
        });
      }
    }

    return res.status(200).json({ success: true, job });
  } catch (error) {
    console.error("Get Applicants Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Recruiter / TPO: Update Application Lifecycle Status (APPLIED, SHORTLISTED, REJECTED, WITHDRAWN)
 */
export const updateStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const applicationId = req.params.id;

    const validStatuses = ["APPLIED", "SHORTLISTED", "REJECTED", "WITHDRAWN"];
    const normalizedStatus = (status || "").toUpperCase();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: `Invalid Application Status: '${status}'. Allowed lifecycle statuses: [${validStatuses.join(", ")}]`,
        success: false,
      });
    }

    const appObj = await Application.findByPk(applicationId, {
      include: [{ model: Job, as: "job", include: [{ model: Company, as: "company" }] }],
    });

    if (!appObj) return res.status(404).json({ message: "Application not found", success: false });

    // Recruiter ownership check
    if (req.user.role === "recruiter") {
      if (appObj.job?.createdById !== req.user.id && appObj.job?.company?.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden - You cannot modify applications for another drive", success: false });
      }
    }

    const oldStatus = appObj.status;
    appObj.status = normalizedStatus;
    if (rejectionReason) appObj.rejectionReason = rejectionReason;

    await appObj.save();

    // Create Notification for Applicant
    await Notification.create({
      userId: appObj.applicantId,
      title: "Application Status Update",
      message: `Your application status for '${appObj.job?.title}' has been updated to: ${normalizedStatus}`,
      type: "status_update",
      link: "/profile",
    });

    await logAuditTrail({
      userId: req.id,
      action: "APPLICATION_STATUS_UPDATED",
      entity: "Application",
      entityId: appObj.id,
      previousValue: { status: oldStatus },
      newValue: { status: appObj.status },
      req,
    });

    return res.status(200).json({
      message: "Application status updated successfully!",
      success: true,
      application: appObj,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
