import { Job, Company, Skill, User } from "../models/index.js";
import { calculateEligibilityAndMatch } from "../utils/eligibilityEngine.js";

export const getRecommendedJobs = async (req, res) => {
  try {
    const studentId = req.id;
    const student = await User.findByPk(studentId, {
      include: [{ model: Skill, as: "skills", through: { attributes: ["proficiency"] } }],
    });

    if (!student) return res.status(404).json({ message: "Student profile not found", success: false });

    const activeJobs = await Job.findAll({
      where: { status: "active" },
      include: [
        { model: Company, as: "company" },
        { model: Skill, as: "skills" },
      ],
    });

    const recommendations = activeJobs
      .map((job) => {
        const evaluation = calculateEligibilityAndMatch(student, job);
        return {
          job,
          isEligible: evaluation.isEligible,
          matchPercentage: evaluation.matchPercentage,
          skillBreakdown: evaluation.skillBreakdown,
          checklist: evaluation.checklist,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 8); // Top 8 recommended drives

    return res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
