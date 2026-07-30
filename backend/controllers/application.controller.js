import { sequelize } from "../config/database.js";
import { Application, Job, User, Company, Notification, Skill } from "../models/index.js";
import { calculateEligibilityAndMatch } from "../utils/eligibilityEngine.js";
import { logAuditTrail } from "../utils/auditLogger.js";

export const applyJob = async (req, res) => {
  const userId = req.id;
  const jobId = req.params.id;
  const { coverLetter } = req.body;

  // Use Managed Sequelize Transaction
  const transaction = await sequelize.transaction();

  try {
    if (!jobId) {
      await transaction.rollback();
      return res.status(400).json({ message: "Drive ID is required", success: false });
    }

    const job = await Job.findByPk(jobId, {
      include: [{ model: Skill, as: "skills" }],
      transaction,
    });
    if (!job) {
      await transaction.rollback();
      return res.status(404).json({ message: "Placement drive not found", success: false });
    }

    // Duplicate Check
    const existingApp = await Application.findOne({
      where: { jobId, applicantId: userId },
      transaction,
    });
    if (existingApp) {
      await transaction.rollback();
      return res.status(400).json({ message: "You have already applied for this drive", success: false });
    }

    // Eligibility check
    const student = await User.findByPk(userId, {
      include: [{ model: Skill, as: "skills" }],
      transaction,
    });

    const eligibility = calculateEligibilityAndMatch(student, job);
    if (!eligibility.isEligible) {
      await transaction.rollback();
      return res.status(400).json({
        message: "You do not meet the minimum eligibility requirements for this drive.",
        success: false,
        checklist: eligibility.checklist,
      });
    }

    // Create Application
    const newApp = await Application.create(
      {
        jobId,
        applicantId: userId,
        status: "pending",
        coverLetter: coverLetter || "",
      },
      { transaction }
    );

    // Notify Recruiter
    await Notification.create(
      {
        userId: job.createdById,
        title: "New Application Received",
        message: `${student.fullName} applied for drive: ${job.title}`,
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
      newValue: { jobId, status: "pending" },
      req,
    });

    return res.status(201).json({
      message: "Application submitted successfully!",
      success: true,
      application: newApp,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Apply Job Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

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
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findByPk(jobId, {
      include: [
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
          ],
        },
      ],
    });

    if (!job) return res.status(404).json({ message: "Drive not found", success: false });

    return res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    const appObj = await Application.findByPk(applicationId, {
      include: [{ model: Job, as: "job" }],
    });
    if (!appObj) return res.status(404).json({ message: "Application not found", success: false });

    const oldStatus = appObj.status;
    appObj.status = status.toLowerCase();
    await appObj.save();

    // Create Notification for Applicant
    await Notification.create({
      userId: appObj.applicantId,
      title: "Application Status Update",
      message: `Your application status for '${appObj.job.title}' has been updated to: ${status.toUpperCase()}`,
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

    return res.status(200).json({ message: "Application status updated successfully!", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
