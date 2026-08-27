import { Job, Company, Skill, User, Application } from "../models/index.js";
import { calculateEligibilityAndMatch } from "../utils/eligibilityEngine.js";
import { Op } from "sequelize";
import { logAuditTrail } from "../utils/auditLogger.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      minCgpa,
      batchYear,
      branchRequirement,
      maxBacklogs,
      positions,
      companyId,
      skills,
    } = req.body;
    const userId = req.id;

    if (!title || !description || !requirements || !salary || !location || !companyId) {
      return res.status(400).json({ message: "Required drive fields missing", success: false });
    }

    const newJob = await Job.create({
      title,
      description,
      requirements,
      salary: parseInt(salary),
      location,
      jobType: jobType || "Full-time",
      experienceLevel: experienceLevel ? parseInt(experienceLevel) : 0,
      minCgpa: minCgpa ? parseFloat(minCgpa) : 6.0,
      batchYear: batchYear ? parseInt(batchYear) : 2026,
      branchRequirement: branchRequirement || "All Branches",
      maxBacklogs: maxBacklogs !== undefined ? parseInt(maxBacklogs) : 0,
      positions: positions ? parseInt(positions) : 1,
      companyId: parseInt(companyId),
      createdById: userId,
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
      newValue: { title, salary, companyId },
      req,
    });

    return res.status(201).json({ message: "Placement Drive posted successfully!", success: true, job: newJob });
  } catch (error) {
    console.error("Post Job Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const location = req.query.location || "";
    const jobType = req.query.jobType || "";
    const minSalary = req.query.minSalary ? parseInt(req.query.minSalary) : 0;
    const sort = req.query.sort || "newest";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = { status: "active" };

    if (keyword && keyword.trim().length > 0) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { requirements: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (location && location.trim().length > 0) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }
    if (jobType && jobType.trim().length > 0) {
      whereClause.jobType = jobType;
    }
    if (minSalary > 0) {
      whereClause.salary = { [Op.gte]: minSalary };
    }

    let order = [["createdAt", "DESC"]];
    if (sort === "salary_high") order = [["salary", "DESC"]];
    if (sort === "salary_low") order = [["salary", "ASC"]];

    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        { model: Company, as: "company", attributes: ["id", "name", "logo", "location"] },
        { model: Skill, as: "skills", through: { attributes: ["isPrimary"] } },
      ],
      order,
      limit,
      offset,
    });

    const count = await Job.count({ where: whereClause });

    return res.status(200).json({
      success: true,
      jobs,
      totalJobs: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get All Jobs Error:", error);
    res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findByPk(jobId, {
      include: [
        { model: Company, as: "company" },
        { model: Skill, as: "skills", through: { attributes: ["isPrimary"] } },
        { model: Application, as: "applications" },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Placement drive not found", success: false });
    }

    // Calculate match score & eligibility if auth token is attached
    let eligibility = null;
    let matchScore = null;
    let skillBreakdown = [];

    let authUser = null;
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        authUser = await User.findByPk(decoded.userId, {
          include: [{ model: Skill, as: "skills" }],
        });
      } catch (err) {
        // Unauthenticated or expired token
      }
    }

    if (authUser && authUser.role === "student") {
      const evalResult = calculateEligibilityAndMatch(authUser, job);
      eligibility = evalResult.eligibility;
      matchScore = evalResult.matchScore;
      skillBreakdown = evalResult.skillBreakdown;
    }

    return res.status(200).json({
      success: true,
      job,
      eligibility,
      matchScore,
      skillBreakdown,
    });
  } catch (error) {
    console.error("Get Job By Id Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const userRole = req.user.role;

    let whereClause = {};
    if (userRole === "recruiter") {
      whereClause = { createdById: adminId };
    }

    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        { model: Company, as: "company", attributes: ["name", "logo"] },
        { model: Application, as: "applications" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error("Get Admin Jobs Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getRecruiterJobs = getAdminJobs;
