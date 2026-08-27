import jwt from "jsonwebtoken";
import { User, Company, Job, Application } from "../models/index.js";
import { JWT_SECRET } from "../config/jwtConfig.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Access Token Required", success: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token", success: false });
    }

    req.id = decoded.userId;
    req.user = await User.findByPk(decoded.userId, { attributes: { exclude: ["password"] } });
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - User no longer exists", success: false });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token Expired or Invalid", success: false });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Accepts one or multiple allowed roles: e.g. authorize("student"), authorize("recruiter", "tpo_admin")
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - Authentication required", success: false });
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
    const userRole = (req.user.role || "").toLowerCase().trim();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden - Access restricted to [${allowedRoles.join(", ")}]. Your role is '${req.user.role}'.`,
        success: false,
      });
    }

    next();
  };
};

export const studentOnly = authorize("student");
export const recruiterOnly = authorize("recruiter");
export const tpoAdminOnly = authorize("tpo_admin");
export const recruiterOrAdminOnly = authorize("recruiter", "tpo_admin");

/**
 * Ensures a recruiter's company profile is verified & APPROVED before allowing placement drive creation
 */
export const requireApprovedCompany = async (req, res, next) => {
  try {
    if (req.user.role === "tpo_admin") {
      return next(); // TPO_ADMIN can create/post drives directly
    }

    const companyId = req.body.companyId || req.params.companyId;
    let company = null;

    if (companyId) {
      company = await Company.findByPk(companyId);
    } else {
      company = await Company.findOne({ where: { userId: req.user.id } });
    }

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found. Please register your company profile first.",
        success: false,
      });
    }

    if (company.userId !== req.user.id && req.user.role !== "tpo_admin") {
      return res.status(403).json({
        message: "Forbidden - You can only create placement drives for your own company.",
        success: false,
      });
    }

    if (company.status !== "APPROVED" && !company.isApproved) {
      return res.status(403).json({
        message: `Forbidden - Your company '${company.name}' verification status is '${company.status}'. Only APPROVED companies can submit placement drives. Please wait for TPO approval.`,
        success: false,
        companyStatus: company.status,
      });
    }

    req.company = company;
    next();
  } catch (error) {
    console.error("Require Approved Company Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Ensures recruiter only modifies/views their own drives (or TPO_ADMIN has full access)
 */
export const requireDriveOwnership = async (req, res, next) => {
  try {
    const driveId = req.params.id || req.params.driveId || req.body.jobId;
    if (!driveId) {
      return res.status(400).json({ message: "Placement Drive ID is required", success: false });
    }

    const drive = await Job.findByPk(driveId, {
      include: [{ model: Company, as: "company" }],
    });

    if (!drive) {
      return res.status(404).json({ message: "Placement drive not found", success: false });
    }

    if (req.user.role !== "tpo_admin" && drive.createdById !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden - You do not have permission to manage this placement drive.",
        success: false,
      });
    }

    req.drive = drive;
    next();
  } catch (error) {
    console.error("Require Drive Ownership Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Ensures student can only access/withdraw their own application (or recruiter/TPO who owns the drive)
 */
export const requireApplicationAccess = async (req, res, next) => {
  try {
    const applicationId = req.params.id || req.params.applicationId;
    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required", success: false });
    }

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Job, as: "job", include: [{ model: Company, as: "company" }] }],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found", success: false });
    }

    if (req.user.role === "student") {
      if (application.applicantId !== req.user.id) {
        return res.status(403).json({
          message: "Forbidden - You cannot access another student's application.",
          success: false,
        });
      }
    } else if (req.user.role === "recruiter") {
      if (application.job?.createdById !== req.user.id && application.job?.company?.userId !== req.user.id) {
        return res.status(403).json({
          message: "Forbidden - You cannot access applications for another company's drive.",
          success: false,
        });
      }
    }

    req.application = application;
    next();
  } catch (error) {
    console.error("Require Application Access Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
