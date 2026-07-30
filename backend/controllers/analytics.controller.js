import { sequelize } from "../config/database.js";
import { QueryTypes } from "sequelize";

// TPO & Recruiter Analytics with Raw SQL Window Functions and Aggregations
export const getTpoAnalytics = async (req, res) => {
  try {
    // 1. Overall Stats Counters
    const [stats] = await sequelize.query(
      `
      SELECT 
        COUNT(DISTINCT c.id) as totalCompanies,
        COUNT(DISTINCT j.id) as totalDrives,
        COUNT(DISTINCT a.id) as totalApplications,
        COUNT(DISTINCT CASE WHEN a.status = 'offered' THEN a.applicantId END) as totalPlacedStudents,
        ROUND(AVG(j.salary), 2) as avgPackageLpa,
        MAX(j.salary) as highestPackageLpa
      FROM Jobs j
      LEFT JOIN Companies c ON j.companyId = c.id
      LEFT JOIN Applications a ON j.id = a.jobId
      `,
      { type: QueryTypes.SELECT }
    );

    // 2. Hiring Funnel Breakup
    const funnel = await sequelize.query(
      `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM Applications 
      GROUP BY status
      ORDER BY count DESC
      `,
      { type: QueryTypes.SELECT }
    );

    // 3. Applications per Day Trend (CTE & Aggregation)
    const dailyApplications = await sequelize.query(
      `
      WITH DailyStats AS (
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m-%d') as appDate,
          COUNT(*) as totalApps
        FROM Applications
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
      )
      SELECT appDate, totalApps FROM DailyStats ORDER BY appDate DESC LIMIT 14
      `,
      { type: QueryTypes.SELECT }
    );

    // 4. Top Required Skills across Placement Drives (SQL Aggregation + Join)
    const topSkills = await sequelize.query(
      `
      SELECT 
        s.name as skillName, 
        COUNT(js.jobId) as demandCount
      FROM Skills s
      JOIN JobSkills js ON s.id = js.skillId
      GROUP BY s.id, s.name
      ORDER BY demandCount DESC
      LIMIT 8
      `,
      { type: QueryTypes.SELECT }
    );

    // 5. Raw SQL Window Function: Rank Top Salary Placement Drives per Company
    const topCompanyDrives = await sequelize.query(
      `
      SELECT * FROM (
        SELECT 
          j.id, j.title, j.salary, j.location, c.name as companyName,
          ROW_NUMBER() OVER (PARTITION BY j.companyId ORDER BY j.salary DESC) as rnk
        FROM Jobs j
        JOIN Companies c ON j.companyId = c.id
      ) ranked
      WHERE rnk = 1
      ORDER BY salary DESC
      LIMIT 6
      `,
      { type: QueryTypes.SELECT }
    );

    return res.status(200).json({
      success: true,
      analytics: {
        stats: stats || {},
        funnel,
        dailyApplications,
        topSkills,
        topCompanyDrives,
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

    // Student App Count by Status
    const [counts] = await sequelize.query(
      `
      SELECT 
        COUNT(*) as totalSubmitted,
        COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) as shortlistedCount,
        COUNT(CASE WHEN status = 'interview_scheduled' THEN 1 END) as interviewCount,
        COUNT(CASE WHEN status = 'offered' THEN 1 END) as offersCount,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedCount
      FROM Applications
      WHERE applicantId = :studentId
      `,
      { replacements: { studentId }, type: QueryTypes.SELECT }
    );

    return res.status(200).json({
      success: true,
      studentAnalytics: counts || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
