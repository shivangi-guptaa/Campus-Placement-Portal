import { User, Company, Job, Application, Skill } from "../models/index.js";
import { sequelize } from "../config/database.js";

// TPO & Recruiter Analytics with Safe Sequelize Queries
export const getTpoAnalytics = async (req, res) => {
  try {
    const totalCompanies = await Company.count();
    const totalDrives = await Job.count();
    const totalApplications = await Application.count();
    const totalPlacedStudents = await Application.count({ where: { status: "offered" } });
    const highestPackageLpa = (await Job.max("salary")) || 0;
    const avgPackageLpa = (await Job.aggregate("salary", "AVG")) || 0;

    const stats = {
      totalCompanies,
      totalDrives,
      totalApplications,
      totalPlacedStudents,
      highestPackageLpa,
      avgPackageLpa: Math.round(avgPackageLpa * 100) / 100,
    };

    const registeredUsers = await User.findAll({
      attributes: ["id", "fullName", "email", "phoneNumber", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 50,
      raw: true,
    });

    const topCompanyDrives = await Job.findAll({
      include: [{ model: Company, as: "company", attributes: ["name"] }],
      order: [["salary", "DESC"]],
      limit: 6,
    }).then((jobs) =>
      jobs.map((j) => ({
        id: j.id,
        title: j.title,
        salary: j.salary,
        location: j.location,
        companyName: j.company?.name || "Company",
      }))
    );

    const funnelData = await Application.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const topSkills = await Skill.findAll({
      attributes: ["id", "name"],
      limit: 8,
      raw: true,
    }).then((skList) =>
      skList.map((s) => ({
        skillName: s.name,
        demandCount: 3,
      }))
    );

    return res.status(200).json({
      success: true,
      analytics: {
        stats,
        funnel: funnelData,
        topSkills,
        topCompanyDrives,
        registeredUsers,
      },
    });
  } catch (error) {
    console.error("TPO Analytics Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Student Personalized Dashboard Metrics
export const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.id;

    const totalSubmitted = await Application.count({ where: { applicantId: studentId } });
    const shortlistedCount = await Application.count({ where: { applicantId: studentId, status: "shortlisted" } });
    const interviewCount = await Application.count({ where: { applicantId: studentId, status: "interview_scheduled" } });
    const offersCount = await Application.count({ where: { applicantId: studentId, status: "offered" } });
    const rejectedCount = await Application.count({ where: { applicantId: studentId, status: "rejected" } });

    return res.status(200).json({
      success: true,
      studentAnalytics: {
        totalSubmitted,
        shortlistedCount,
        interviewCount,
        offersCount,
        rejectedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
