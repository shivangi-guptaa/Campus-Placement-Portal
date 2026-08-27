import { Company, User, Job } from "../models/index.js";
import { uploadFile } from "../utils/upload.js";
import { logAuditTrail } from "../utils/auditLogger.js";
import { sequelize } from "../config/database.js";

/**
 * Valid Company State Machine Transitions
 */
export const ALLOWED_COMPANY_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["SUSPENDED", "REJECTED"],
  REJECTED: ["PENDING"],
  SUSPENDED: ["APPROVED", "REJECTED"],
};

export const isValidCompanyTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_COMPANY_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

export const registerCompany = async (req, res) => {
  const { companyName, description, website, location, industry } = req.body;
  const userId = req.id;

  try {
    if (!companyName) {
      return res.status(400).json({ message: "Company name is required", success: false });
    }

    const existing = await Company.findOne({ where: { name: companyName } });
    if (existing) {
      return res.status(400).json({ message: "Company name is already registered", success: false });
    }

    // New companies are created in PENDING status awaiting TPO verification
    const newCompany = await Company.create({
      name: companyName,
      description: description || "",
      website: website || "",
      location: location || "",
      industry: industry || "Information Technology",
      status: "PENDING",
      isApproved: false,
      userId,
    });

    await logAuditTrail({
      userId,
      action: "COMPANY_REGISTERED_PENDING",
      entity: "Company",
      entityId: newCompany.id,
      newValue: { name: companyName, status: "PENDING" },
      req,
    });

    return res.status(201).json({
      message: "Company profile submitted successfully! It is currently PENDING approval by the TPO.",
      success: true,
      company: newCompany,
    });
  } catch (error) {
    console.error("Register Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const userRole = req.user.role;

    let companies = [];
    if (userRole === "tpo_admin") {
      companies = await Company.findAll({
        include: [{ model: User, as: "owner", attributes: ["id", "fullName", "email", "phoneNumber"] }],
        order: [["createdAt", "DESC"]],
      });
    } else {
      companies = await Company.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });
    }

    return res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findByPk(companyId, {
      include: [{ model: User, as: "owner", attributes: ["id", "fullName", "email", "phoneNumber"] }],
    });
    if (!company) return res.status(404).json({ message: "Company not found", success: false });
    return res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location, industry } = req.body;
    const file = req.file;
    const companyId = req.params.id;

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found", success: false });

    // Ownership check: only company owner or TPO can update
    if (req.user.role !== "tpo_admin" && company.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden - You do not own this company profile", success: false });
    }

    if (name) company.name = name;
    if (description) company.description = description;
    if (website) company.website = website;
    if (location) company.location = location;
    if (industry) company.industry = industry;

    if (file) {
      const uploadRes = await uploadFile(file, "companies");
      if (uploadRes) company.logo = uploadRes.url;
    }

    await company.save();

    await logAuditTrail({
      userId: req.id,
      action: "COMPANY_UPDATED",
      entity: "Company",
      entityId: company.id,
      newValue: { name: company.name, location: company.location },
      req,
    });

    return res.status(200).json({ message: "Company profile updated successfully!", success: true, company });
  } catch (error) {
    console.error("Update Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Approve Company Verification
 */
export const approveCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can verify and approve companies", success: false });
    }

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found", success: false });

    if (!isValidCompanyTransition(company.status, "APPROVED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot approve company with status '${company.status}'. Allowed transitions: [${(ALLOWED_COMPANY_TRANSITIONS[company.status] || []).join(", ")}]`,
        success: false,
      });
    }

    company.status = "APPROVED";
    company.isApproved = true;
    company.approvedById = req.id;
    company.approvedAt = new Date();
    company.rejectionReason = null;
    await company.save();

    await logAuditTrail({
      userId: req.id,
      action: "COMPANY_APPROVED",
      entity: "Company",
      entityId: company.id,
      newValue: { status: "APPROVED" },
      req,
    });

    return res.status(200).json({
      message: `Company '${company.name}' has been verified and APPROVED successfully!`,
      success: true,
      company,
    });
  } catch (error) {
    console.error("Approve Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Reject Company Verification
 */
export const rejectCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { rejectionReason } = req.body;

    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can reject company profiles", success: false });
    }

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found", success: false });

    if (!isValidCompanyTransition(company.status, "REJECTED")) {
      return res.status(400).json({
        message: `Invalid State Transition: Cannot reject company with status '${company.status}'. Allowed transitions: [${(ALLOWED_COMPANY_TRANSITIONS[company.status] || []).join(", ")}]`,
        success: false,
      });
    }

    company.status = "REJECTED";
    company.isApproved = false;
    company.rejectionReason = rejectionReason || "Does not meet campus placement verification criteria.";
    await company.save();

    await logAuditTrail({
      userId: req.id,
      action: "COMPANY_REJECTED",
      entity: "Company",
      entityId: company.id,
      newValue: { status: "REJECTED", rejectionReason: company.rejectionReason },
      req,
    });

    return res.status(200).json({
      message: `Company '${company.name}' verification has been REJECTED.`,
      success: true,
      company,
    });
  } catch (error) {
    console.error("Reject Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Suspend Company (Blocks company drives & recruiter operations)
 */
export const suspendCompany = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const companyId = req.params.id;
    const { reason } = req.body;

    if (req.user.role !== "tpo_admin") {
      await transaction.rollback();
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can suspend companies", success: false });
    }

    const company = await Company.findByPk(companyId, { transaction });
    if (!company) {
      await transaction.rollback();
      return res.status(404).json({ message: "Company not found", success: false });
    }

    if (!isValidCompanyTransition(company.status, "SUSPENDED")) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Invalid State Transition: Cannot suspend company with status '${company.status}'. Company must be in 'APPROVED' state.`,
        success: false,
      });
    }

    company.status = "SUSPENDED";
    company.isApproved = false;
    company.rejectionReason = reason || "Company suspended by TPO Office.";
    await company.save({ transaction });

    // Inactivate any active placement drives for this company
    await Job.update(
      { status: "inactive" },
      { where: { companyId: company.id }, transaction }
    );

    await transaction.commit();

    await logAuditTrail({
      userId: req.id,
      action: "COMPANY_SUSPENDED",
      entity: "Company",
      entityId: company.id,
      newValue: { status: "SUSPENDED", reason },
      req,
    });

    return res.status(200).json({
      message: `Company '${company.name}' has been SUSPENDED and its active placement drives have been deactivated.`,
      success: true,
      company,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rbErr) {}
    }
    console.error("Suspend Company Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: List Pending Companies
 */
export const getPendingCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { status: "PENDING" },
      include: [{ model: User, as: "owner", attributes: ["id", "fullName", "email", "phoneNumber"] }],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({ success: true, count: companies.length, companies });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
