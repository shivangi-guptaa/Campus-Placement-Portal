import { Job, Company, Skill, User, Application, PlacementPolicy } from "../models/index.js";
import { sequelize } from "../config/database.js";
import { checkStudentEligibility } from "../services/eligibilityService.js";
import { Op } from "sequelize";
import { logAuditTrail } from "../utils/auditLogger.js";

/**
 * Valid Placement Drive State Transitions
 */
export const ALLOWED_DRIVE_TRANSITIONS = {
  DRAFT: ["PENDING_APPROVAL"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED"],
  APPROVED: ["PUBLISHED", "REJECTED"],
  PUBLISHED: ["CLOSED", "COMPLETED"],
  CLOSED: ["PUBLISHED", "COMPLETED"],
  REJECTED: ["PENDING_APPROVAL"],
  COMPLETED: [], // Terminal State
};

export const isValidDriveTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_DRIVE_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

/**
 * Post Placement Drive / Opportunity
 */
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      packageMin,
      packageMax,
      ctc,
      location,
      jobType,
      driveType,
      experienceLevel,
      minCgpa,
      batchYear,
      branchRequirement,
      maxBacklogs,
      positions,
      applicationDeadline,
      driveDate,
      externalUrl,
      companyId,
      skills,
    } = req.body;
    const userId = req.id;
    const userRole = req.user.role;

    if (!title || !description || !requirements || !salary || !location || !companyId) {
      return res.status(400).json({ message: "Required drive fields missing", success: false });
    }

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found", success: false });
    }

    // Security: Unapproved company cannot publish/submit drive
    if (userRole === "recruiter") {
      if (company.userId !== userId) {
        return res.status(403).json({ message: "Forbidden - You cannot post drives for another recruiter's company", success: false });
      }
      if (company.status !== "APPROVED" && !company.isApproved) {
        return res.status(403).json({
          message: `Forbidden - Your company '${company.name}' verification status is '${company.status}'. Only APPROVED companies can submit placement drives. Please wait for TPO verification.`,
          success: false,
          companyStatus: company.status,
        });
      }
    }

    const isCampusDrive = (driveType || "ON_CAMPUS").toUpperCase() === "ON_CAMPUS";

    // Security: Recruiter cannot publish ON_CAMPUS drive directly
    let initialApprovalStatus = "PENDING_APPROVAL";
    if (userRole === "tpo_admin") {
      initialApprovalStatus = "PUBLISHED";
    } else if (!isCampusDrive) {
      initialApprovalStatus = "PUBLISHED"; // Off-campus opportunities can be direct
    }

    const calculatedSalary = parseInt(salary || ctc || packageMax || 0);

    const newJob = await Job.create({
      title,
      description,
      requirements,
      salary: calculatedSalary,
      packageMin: packageMin ? parseFloat(packageMin) : calculatedSalary,
      packageMax: packageMax ? parseFloat(packageMax) : calculatedSalary,
      ctc: ctc ? parseFloat(ctc) : calculatedSalary,
      location,
      jobType: jobType || "Full-time",
      driveType: isCampusDrive ? "ON_CAMPUS" : "OFF_CAMPUS",
      approvalStatus: initialApprovalStatus,
      experienceLevel: experienceLevel ? parseInt(experienceLevel) : 0,
      minCgpa: minCgpa ? parseFloat(minCgpa) : 6.0,
      batchYear: batchYear ? parseInt(batchYear) : 2026,
      branchRequirement: branchRequirement || "All Branches",
      maxBacklogs: maxBacklogs !== undefined ? parseInt(maxBacklogs) : 0,
      positions: positions ? parseInt(positions) : 1,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      driveDate: driveDate ? new Date(driveDate) : null,
      externalUrl: externalUrl || null,
      companyId: parseInt(companyId),
      createdById: userId,
      status: initialApprovalStatus === "PUBLISHED" ? "active" : "inactive",
    });

    if (skills) {
      const skillList = String(skills).split(",").map((s) => s.trim()).filter(Boolean);
      for (const sName of skillList) {
        const [skObj] = await Skill.findOrCreate({ where: { name: sName } });
        await newJob.addSkill(skObj, { through: { isPrimary: true } });
      }
    }

    await logAuditTrail({
      userId,
      action: "PLACEMENT_DRIVE_CREATED",
      entity: "Job",
      entityId: newJob.id,
      newValue: { title, salary: calculatedSalary, approvalStatus: initialApprovalStatus, driveType: newJob.driveType },
      req,
    });

    const successMessage = isCampusDrive && userRole === "recruiter"
      ? "Placement Drive submitted successfully! It is currently PENDING TPO review and approval."
      : "Placement Drive created and published successfully!";

    return res.status(201).json({
      message: successMessage,
      success: true,
      job: newJob,
    });
  } catch (error) {
    console.error("Post Job Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Approve Placement Drive
 */
export const approveDrive = async (req, res) => {
  try {
    const driveId = req.params.id;

    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can approve placement drives", success: false });
    }

    const drive = await Job.findByPk(driveId);
    if (!drive) return res.status(404).json({ message: "Placement drive not found", success: false });

    // Validate State Machine Transition
    if (!isValidDriveTransition(drive.approvalStatus, "APPROVED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot approve drive with status '${drive.approvalStatus}'. Allowed transitions from '${drive.approvalStatus}': [${(ALLOWED_DRIVE_TRANSITIONS[drive.approvalStatus] || []).join(", ")}]`,
        success: false,
      });
    }

    drive.approvalStatus = "APPROVED";
    drive.approvedById = req.id;
    drive.approvedAt = new Date();
    drive.rejectionReason = null;
    await drive.save();

    await logAuditTrail({
      userId: req.id,
      action: "DRIVE_APPROVED",
      entity: "Job",
      entityId: drive.id,
      newValue: { approvalStatus: "APPROVED" },
      req,
    });

    return res.status(200).json({
      message: `Placement Drive '${drive.title}' has been APPROVED! You can now publish it for students.`,
      success: true,
      drive,
    });
  } catch (error) {
    console.error("Approve Drive Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Reject Placement Drive
 */
export const rejectDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    const { rejectionReason } = req.body;

    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can reject placement drives", success: false });
    }

    const drive = await Job.findByPk(driveId);
    if (!drive) return res.status(404).json({ message: "Placement drive not found", success: false });

    // Validate State Machine Transition
    if (!isValidDriveTransition(drive.approvalStatus, "REJECTED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot reject drive with status '${drive.approvalStatus}'. Allowed transitions from '${drive.approvalStatus}': [${(ALLOWED_DRIVE_TRANSITIONS[drive.approvalStatus] || []).join(", ")}]`,
        success: false,
      });
    }

    drive.approvalStatus = "REJECTED";
    drive.rejectionReason = rejectionReason || "Does not comply with campus placement eligibility policy.";
    drive.status = "inactive";
    await drive.save();

    await logAuditTrail({
      userId: req.id,
      action: "DRIVE_REJECTED",
      entity: "Job",
      entityId: drive.id,
      newValue: { approvalStatus: "REJECTED", rejectionReason: drive.rejectionReason },
      req,
    });

    return res.status(200).json({
      message: `Placement Drive '${drive.title}' has been REJECTED.`,
      success: true,
      drive,
    });
  } catch (error) {
    console.error("Reject Drive Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Publish Placement Drive
 */
export const publishDrive = async (req, res) => {
  try {
    const driveId = req.params.id;

    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can publish on-campus placement drives", success: false });
    }

    const drive = await Job.findByPk(driveId);
    if (!drive) return res.status(404).json({ message: "Placement drive not found", success: false });

    // Validate State Machine Transition
    if (!isValidDriveTransition(drive.approvalStatus, "PUBLISHED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot publish drive with status '${drive.approvalStatus}'. Drive must be in 'APPROVED' or 'CLOSED' state before publishing.`,
        success: false,
      });
    }

    drive.approvalStatus = "PUBLISHED";
    drive.status = "active";
    drive.approvedById = req.id;
    drive.approvedAt = new Date();
    await drive.save();

    await logAuditTrail({
      userId: req.id,
      action: "DRIVE_PUBLISHED",
      entity: "Job",
      entityId: drive.id,
      newValue: { approvalStatus: "PUBLISHED" },
      req,
    });

    return res.status(200).json({
      message: `Placement Drive '${drive.title}' is now PUBLISHED and visible to eligible campus students!`,
      success: true,
      drive,
    });
  } catch (error) {
    console.error("Publish Drive Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Close Placement Drive (TPO or Drive Recruiter)
 */
export const closeDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    const drive = await Job.findByPk(driveId);
    if (!drive) return res.status(404).json({ message: "Placement drive not found", success: false });

    // Ownership check for recruiter
    if (req.user.role === "recruiter" && drive.createdById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden - You cannot close another company's drive", success: false });
    }

    if (!isValidDriveTransition(drive.approvalStatus, "CLOSED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot close drive with status '${drive.approvalStatus}'.`,
        success: false,
      });
    }

    drive.approvalStatus = "CLOSED";
    drive.status = "inactive";
    await drive.save();

    return res.status(200).json({
      message: `Placement Drive '${drive.title}' has been CLOSED for new applications.`,
      success: true,
      drive,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Mark Placement Drive as Completed (TPO)
 */
export const completeDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can mark drives as completed", success: false });
    }

    const drive = await Job.findByPk(driveId);
    if (!drive) return res.status(404).json({ message: "Placement drive not found", success: false });

    if (!isValidDriveTransition(drive.approvalStatus, "COMPLETED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot mark drive '${drive.approvalStatus}' as COMPLETED.`,
        success: false,
      });
    }

    drive.approvalStatus = "COMPLETED";
    drive.status = "inactive";
    await drive.save();

    return res.status(200).json({
      message: `Placement Drive '${drive.title}' has been marked as COMPLETED.`,
      success: true,
      drive,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Get All Published Placement Drives & Opportunities (Students & Public)
 */
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const driveType = req.query.driveType; // "ON_CAMPUS" | "OFF_CAMPUS"

    const whereClause = {
      approvalStatus: "PUBLISHED",
      status: "active",
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ],
    };

    if (driveType) {
      whereClause.driveType = driveType.toUpperCase();
    }

    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "logo", "location", "website", "industry", "status"],
        },
        {
          model: Skill,
          as: "skills",
          attributes: ["id", "name"],
          through: { attributes: ["isPrimary"] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Get All Jobs Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Student: Get Verified Eligible Placement Drives
 */
export const getEligibleJobs = async (req, res) => {
  try {
    const userId = req.id;
    const student = await User.findByPk(userId, {
      include: [{ model: Skill, as: "skills" }],
    });

    if (!student) {
      return res.status(404).json({ message: "Student account not found", success: false });
    }

    const activePolicy = await PlacementPolicy.findOne({ where: { isActive: true } });

    const publishedDrives = await Job.findAll({
      where: {
        approvalStatus: "PUBLISHED",
        status: "active",
      },
      include: [
        { model: Company, as: "company" },
        { model: Skill, as: "skills" },
      ],
      order: [["createdAt", "DESC"]],
    });

    const evaluatedDrives = await Promise.all(
      publishedDrives.map(async (drive) => {
        const evalResult = await checkStudentEligibility(student, drive, activePolicy);
        return {
          ...drive.toJSON(),
          eligibility: evalResult,
        };
      })
    );

    return res.status(200).json({
      success: true,
      eligibleDrives: evaluatedDrives.filter((d) => d.eligibility.eligible),
      allDrivesWithEligibility: evaluatedDrives,
    });
  } catch (error) {
    console.error("Get Eligible Jobs Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Get Job By ID
 */
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findByPk(jobId, {
      include: [
        { model: Company, as: "company" },
        { model: Skill, as: "skills" },
        {
          model: Application,
          as: "applications",
          attributes: ["id", "applicantId", "status", "finalResult", "createdAt"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Placement drive not found", success: false });
    }

    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error("Get Job By ID Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Recruiter & TPO: Get Posted Drives with Application Counts
 */
export const getRecruiterJobs = async (req, res) => {
  try {
    const userId = req.id;
    const userRole = req.user.role;

    let whereClause = {};
    if (userRole === "recruiter") {
      whereClause = { createdById: userId };
    }

    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        { model: Company, as: "company" },
        { model: Application, as: "applications" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Get Recruiter Jobs Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
