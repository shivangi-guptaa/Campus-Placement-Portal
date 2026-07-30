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

    if (keyword) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { requirements: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (jobType) whereClause.jobType = jobType;
    if (minSalary > 0) whereClause.salary = { [Op.gte]: minSalary };

    let order = [["createdAt", "DESC"]];
    if (sort === "salary_high") order = [["salary", "DESC"]];
    if (sort === "salary_low") order = [["salary", "ASC"]];

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        { model: Company, as: "company", attributes: ["id", "name", "logo", "location"] },
        { model: Skill, as: "skills", through: { attributes: ["isPrimary"] } },
      ],
      order,
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      jobs,
      totalJobs: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get All Jobs Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId || jobId === "undefined") {
      return res.status(400).json({ message: "Invalid Job ID", success: false });
    }

    const job = await Job.findByPk(jobId, {
      include: [
        { model: Company, as: "company" },
        { model: Skill, as: "skills", through: { attributes: ["isPrimary"] } },
        { model: Application, as: "applications" },
      ],
    });

    if (!job) return res.status(404).json({ message: "Placement Drive not found", success: false });

    // Optional user token extraction
    let userId = req.user?.id;
    if (!userId) {
      let token = req.cookies?.token;
      if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded?.userId;
        } catch (e) {}
      }
    }

    let eligibilityData = null;
    if (userId) {
      const student = await User.findByPk(userId, {
        include: [{ model: Skill, as: "skills", through: { attributes: ["proficiency"] } }],
      });
      if (student && student.role === "student") {
        eligibilityData = calculateEligibilityAndMatch(student, job);
      }
    }

    return res.status(200).json({ success: true, job, eligibilityData });
  } catch (error) {
    console.error("Get Job By ID Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.id;
    const jobs = await Job.findAll({
      where: { createdById: recruiterId },
      include: [
        { model: Company, as: "company" },
        { model: Application, as: "applications" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
