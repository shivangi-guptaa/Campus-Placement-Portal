import { ApplicationRound, Application, Job, User, Notification } from "../models/index.js";
import { logAuditTrail } from "../utils/auditLogger.js";

/**
 * Add a Recruitment Round to an Application
 */
export const addRound = async (req, res) => {
  try {
    const { applicationId, roundName, roundType, scheduledAt, meetingLink, locationDetails, feedback, score } = req.body;

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Job, as: "job" },
        { model: User, as: "applicant" },
      ],
    });

    if (!application) return res.status(404).json({ message: "Application not found", success: false });

    // Ownership check for recruiter
    if (req.user.role === "recruiter" && application.job?.createdById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden - You cannot schedule rounds for another drive", success: false });
    }

    const currentRoundsCount = await ApplicationRound.count({ where: { applicationId } });

    const newRound = await ApplicationRound.create({
      applicationId,
      roundNumber: currentRoundsCount + 1,
      roundName: roundName || `Round ${currentRoundsCount + 1}: Technical Assessment`,
      roundType: roundType || "TECHNICAL_INTERVIEW",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
      meetingLink: meetingLink || "",
      locationDetails: locationDetails || "",
      feedback: feedback || "",
      score: score ? parseFloat(score) : null,
      updatedById: req.id,
    });

    // Update application status to interview_scheduled
    application.status = "interview_scheduled";
    await application.save();

    // Notify Student
    await Notification.create({
      userId: application.applicantId,
      title: "New Recruitment Round Scheduled",
      message: `${newRound.roundName} scheduled for drive: ${application.job?.title}`,
      type: "round_scheduled",
      link: "/profile",
    });

    await logAuditTrail({
      userId: req.id,
      action: "RECRUITMENT_ROUND_CREATED",
      entity: "ApplicationRound",
      entityId: newRound.id,
      newValue: { roundName: newRound.roundName, status: "SCHEDULED" },
      req,
    });

    return res.status(201).json({
      message: `Recruitment ${newRound.roundName} scheduled successfully!`,
      success: true,
      round: newRound,
    });
  } catch (error) {
    console.error("Add Round Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Update Recruitment Round Status & Feedback
 */
export const updateRound = async (req, res) => {
  try {
    const roundId = req.params.id;
    const { status, feedback, score, meetingLink, scheduledAt } = req.body;

    const round = await ApplicationRound.findByPk(roundId, {
      include: [{ model: Application, as: "application", include: [{ model: Job, as: "job" }] }],
    });

    if (!round) return res.status(404).json({ message: "Recruitment round not found", success: false });

    // Recruiter ownership check
    if (req.user.role === "recruiter" && round.application?.job?.createdById !== req.user.id) {
      return res.status(403).json({ message: "Forbidden - You cannot evaluate rounds for another drive", success: false });
    }

    if (status) round.status = status.toUpperCase();
    if (feedback !== undefined) round.feedback = feedback;
    if (score !== undefined) round.score = parseFloat(score);
    if (meetingLink) round.meetingLink = meetingLink;
    if (scheduledAt) round.scheduledAt = new Date(scheduledAt);
    round.updatedById = req.id;

    await round.save();

    return res.status(200).json({
      message: `Round '${round.roundName}' evaluation updated to: ${round.status}`,
      success: true,
      round,
    });
  } catch (error) {
    console.error("Update Round Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Get All Rounds for an Application
 */
export const getRoundsByApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    const rounds = await ApplicationRound.findAll({
      where: { applicationId },
      order: [["roundNumber", "ASC"]],
    });

    return res.status(200).json({ success: true, rounds });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
