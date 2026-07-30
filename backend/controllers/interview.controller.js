import { Interview, InterviewFeedback, Application, Job, User, Notification } from "../models/index.js";
import { logAuditTrail } from "../utils/auditLogger.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, mode, meetingLink, locationDetails, notes } = req.body;

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Job, as: "job" }, { model: User, as: "applicant" }],
    });

    if (!application) return res.status(404).json({ message: "Application not found", success: false });

    const newInterview = await Interview.create({
      applicationId,
      scheduledAt: new Date(scheduledAt),
      mode: mode || "Online",
      meetingLink: meetingLink || "",
      locationDetails: locationDetails || "",
      notes: notes || "",
      status: "scheduled",
    });

    // Update Application Status
    application.status = "interview_scheduled";
    await application.save();

    // Notify Candidate
    await Notification.create({
      userId: application.applicantId,
      title: "Interview Scheduled!",
      message: `An interview has been scheduled for '${application.job.title}' on ${new Date(scheduledAt).toLocaleString()}`,
      type: "interview",
      link: "/profile",
    });

    await logAuditTrail({
      userId: req.id,
      action: "INTERVIEW_SCHEDULED",
      entity: "Interview",
      entityId: newInterview.id,
      newValue: { applicationId, scheduledAt, mode },
      req,
    });

    return res.status(201).json({
      message: "Interview scheduled successfully!",
      success: true,
      interview: newInterview,
    });
  } catch (error) {
    console.error("Schedule Interview Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const submitInterviewFeedback = async (req, res) => {
  try {
    const { interviewId, communicationRating, technicalRating, problemSolvingRating, overallRating, recommendation, feedbackNotes } = req.body;

    const interview = await Interview.findByPk(interviewId, {
      include: [
        {
          model: Application,
          as: "application",
          include: [{ model: Job, as: "job" }],
        },
      ],
    });

    if (!interview) return res.status(404).json({ message: "Interview record not found", success: false });

    const [feedback, created] = await InterviewFeedback.findOrCreate({
      where: { interviewId },
      defaults: {
        evaluatorId: req.id,
        communicationRating: parseInt(communicationRating) || 3,
        technicalRating: parseInt(technicalRating) || 3,
        problemSolvingRating: parseInt(problemSolvingRating) || 3,
        overallRating: parseInt(overallRating) || 3,
        recommendation: recommendation || "hold",
        feedbackNotes: feedbackNotes || "",
      },
    });

    if (!created) {
      feedback.communicationRating = parseInt(communicationRating) || feedback.communicationRating;
      feedback.technicalRating = parseInt(technicalRating) || feedback.technicalRating;
      feedback.problemSolvingRating = parseInt(problemSolvingRating) || feedback.problemSolvingRating;
      feedback.overallRating = parseInt(overallRating) || feedback.overallRating;
      feedback.recommendation = recommendation || feedback.recommendation;
      feedback.feedbackNotes = feedbackNotes || feedback.feedbackNotes;
      await feedback.save();
    }

    interview.status = "completed";
    await interview.save();

    // Auto update application status if hired/rejected
    if (recommendation === "hire") {
      interview.application.status = "offered";
      await interview.application.save();
    } else if (recommendation === "reject") {
      interview.application.status = "rejected";
      await interview.application.save();
    }

    await logAuditTrail({
      userId: req.id,
      action: "INTERVIEW_FEEDBACK_SUBMITTED",
      entity: "InterviewFeedback",
      entityId: feedback.id,
      newValue: { recommendation, overallRating },
      req,
    });

    return res.status(200).json({ message: "Interview feedback saved successfully!", success: true, feedback });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
