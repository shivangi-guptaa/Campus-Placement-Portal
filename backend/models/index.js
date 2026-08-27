import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// 1. User Model
export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("student", "recruiter", "tpo_admin"),
    defaultValue: "student",
  },
  degree: { type: DataTypes.STRING, defaultValue: "B.Tech" },
  branch: { type: DataTypes.STRING, defaultValue: "Computer Science" },
  cgpa: { type: DataTypes.FLOAT, defaultValue: 8.0 },
  batchYear: { type: DataTypes.INTEGER, defaultValue: 2026 },
  backlogsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  placementStatus: {
    type: DataTypes.ENUM("NOT_PLACED", "PLACED", "MULTIPLE_OFFERS", "OPTED_OUT"),
    defaultValue: "NOT_PLACED",
  },
  currentPackage: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  placedCompanyName: { type: DataTypes.STRING },
  placedDate: { type: DataTypes.DATE },
  bio: { type: DataTypes.TEXT },
  profilePhoto: { type: DataTypes.STRING },
  resume: { type: DataTypes.STRING },
  resumeOriginalName: { type: DataTypes.STRING },
}, {
  indexes: [
    { unique: true, fields: ["email"], name: "idx_users_email" },
    { fields: ["role"], name: "idx_users_role" },
    { fields: ["batchYear"], name: "idx_users_batch_year" },
    { fields: ["placementStatus"], name: "idx_users_placement_status" }
  ]
});

// 2. Company Model
export const Company = sequelize.define("Company", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  website: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  logo: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING, defaultValue: "Information Technology" },
  status: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "SUSPENDED"),
    defaultValue: "PENDING",
  },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  rejectionReason: { type: DataTypes.TEXT },
  approvedById: { type: DataTypes.INTEGER },
  approvedAt: { type: DataTypes.DATE },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [
    { fields: ["userId"], name: "idx_companies_user_id" },
    { fields: ["name"], name: "idx_companies_name" },
    { fields: ["status"], name: "idx_companies_status" }
  ]
});

// 3. Category Model
export const Category = sequelize.define("Category", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  icon: { type: DataTypes.STRING },
  slug: { type: DataTypes.STRING, unique: true }
});

// 4. Job (Placement Drive) Model
export const Job = sequelize.define("Job", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  requirements: { type: DataTypes.TEXT, allowNull: false },
  salary: { type: DataTypes.INTEGER, allowNull: false }, // Base CTC in LPA
  packageMin: { type: DataTypes.DECIMAL(10, 2) },
  packageMax: { type: DataTypes.DECIMAL(10, 2) },
  ctc: { type: DataTypes.DECIMAL(10, 2) },
  location: { type: DataTypes.STRING, allowNull: false },
  jobType: {
    type: DataTypes.ENUM("Full-time", "Internship", "PPO"),
    defaultValue: "Full-time"
  },
  driveType: {
    type: DataTypes.ENUM("ON_CAMPUS", "OFF_CAMPUS"),
    defaultValue: "ON_CAMPUS",
  },
  approvalStatus: {
    type: DataTypes.ENUM("DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "PUBLISHED", "CLOSED", "COMPLETED"),
    defaultValue: "PENDING_APPROVAL",
  },
  experienceLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
  minCgpa: { type: DataTypes.FLOAT, defaultValue: 6.0 },
  batchYear: { type: DataTypes.INTEGER, defaultValue: 2026 },
  branchRequirement: { type: DataTypes.STRING, defaultValue: "All Branches" },
  maxBacklogs: { type: DataTypes.INTEGER, defaultValue: 0 },
  positions: { type: DataTypes.INTEGER, defaultValue: 1 },
  applicationDeadline: { type: DataTypes.DATE },
  driveDate: { type: DataTypes.DATE },
  externalUrl: { type: DataTypes.STRING },
  approvedById: { type: DataTypes.INTEGER },
  approvedAt: { type: DataTypes.DATE },
  rejectionReason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("active", "closed", "inactive"), defaultValue: "active" },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  categoryId: { type: DataTypes.INTEGER },
  createdById: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [
    { fields: ["companyId", "status"], name: "idx_job_company_status" },
    { fields: ["categoryId", "location"], name: "idx_job_cat_loc" },
    { fields: ["createdById"], name: "idx_job_created_by" },
    { fields: ["status"], name: "idx_job_status" },
    { fields: ["driveType"], name: "idx_job_drive_type" },
    { fields: ["approvalStatus"], name: "idx_job_approval_status" }
  ]
});

// 5. Skill Model
export const Skill = sequelize.define("Skill", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: "Technical" }
}, {
  indexes: [
    { unique: true, fields: ["name"], name: "idx_skills_name" }
  ]
});

// 6. JobSkills Junction Model
export const JobSkill = sequelize.define("JobSkill", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  skillId: { type: DataTypes.INTEGER, allowNull: false },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  indexes: [
    { unique: true, fields: ["jobId", "skillId"], name: "idx_job_skills_uniq" }
  ]
});

// 7. UserSkills Junction Model
export const UserSkill = sequelize.define("UserSkill", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  skillId: { type: DataTypes.INTEGER, allowNull: false },
  proficiency: {
    type: DataTypes.ENUM("Beginner", "Intermediate", "Expert"),
    defaultValue: "Intermediate"
  }
}, {
  indexes: [
    { unique: true, fields: ["userId", "skillId"], name: "idx_user_skills_uniq" }
  ]
});

// 8. Application Model (Strictly Application Lifecycle: APPLIED, SHORTLISTED, REJECTED, WITHDRAWN)
export const Application = sequelize.define("Application", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("APPLIED", "SHORTLISTED", "REJECTED", "WITHDRAWN"),
    defaultValue: "APPLIED"
  },
  coverLetter: { type: DataTypes.TEXT },
  rejectionReason: { type: DataTypes.TEXT },
  appliedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { unique: true, fields: ["jobId", "applicantId"], name: "idx_app_job_applicant" },
    { fields: ["status", "createdAt"], name: "idx_app_status_created" },
    { fields: ["applicantId"], name: "idx_app_applicant_id" }
  ]
});

// 9. ApplicationRound Model (Multi-Round Recruitment Pipeline Progression)
export const ApplicationRound = sequelize.define("ApplicationRound", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  applicationId: { type: DataTypes.INTEGER, allowNull: false },
  roundNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
  roundName: { type: DataTypes.STRING, allowNull: false },
  roundType: {
    type: DataTypes.ENUM("APTITUDE", "CODING", "TECHNICAL_INTERVIEW", "HR_INTERVIEW", "GROUP_DISCUSSION", "OTHER"),
    defaultValue: "TECHNICAL_INTERVIEW"
  },
  scheduledAt: { type: DataTypes.DATE },
  status: {
    type: DataTypes.ENUM("PENDING", "SCHEDULED", "PASSED", "FAILED", "ABSENT"),
    defaultValue: "PENDING"
  },
  feedback: { type: DataTypes.TEXT },
  score: { type: DataTypes.FLOAT },
  meetingLink: { type: DataTypes.STRING },
  locationDetails: { type: DataTypes.STRING },
  updatedById: { type: DataTypes.INTEGER }
}, {
  indexes: [
    { fields: ["applicationId"], name: "idx_app_rounds_app_id" },
    { fields: ["status"], name: "idx_app_rounds_status" }
  ]
});

// 10. PlacementRecord Model (Canonical Source of Truth for Official Placement Offers & Outcomes)
export const PlacementRecord = sequelize.define("PlacementRecord", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  driveId: { type: DataTypes.INTEGER, allowNull: false },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  companyName: { type: DataTypes.STRING, allowNull: false },
  offeredPackage: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Official CTC in LPA
  offerType: {
    type: DataTypes.ENUM("FTE", "PPO", "INTERNSHIP"),
    defaultValue: "FTE"
  },
  status: {
    type: DataTypes.ENUM("PENDING_TPO_CONFIRMATION", "CONFIRMED_PLACED", "REJECTED"),
    defaultValue: "PENDING_TPO_CONFIRMATION"
  },
  offerLetterUrl: { type: DataTypes.STRING },
  confirmedById: { type: DataTypes.INTEGER },
  confirmedAt: { type: DataTypes.DATE },
  rejectionReason: { type: DataTypes.TEXT }
}, {
  indexes: [
    { fields: ["studentId"], name: "idx_pl_records_student_id" },
    { fields: ["driveId"], name: "idx_pl_records_drive_id" },
    { fields: ["companyId"], name: "idx_pl_records_company_id" },
    { fields: ["status"], name: "idx_pl_records_status" }
  ]
});

// 11. PlacementPolicy Model (Institutional Policy Rules)
export const PlacementPolicy = sequelize.define("PlacementPolicy", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, defaultValue: "Default Institutional Placement Policy" },
  maxOffersAllowed: { type: DataTypes.INTEGER, defaultValue: 1 },
  allowPlacedStudentsToApply: { type: DataTypes.BOOLEAN, defaultValue: false },
  minCtcIncreasePercentage: { type: DataTypes.FLOAT, defaultValue: 50.0 },
  dreamCompanyMinCtc: { type: DataTypes.FLOAT, defaultValue: 10.0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// 12. SavedJob Model
export const SavedJob = sequelize.define("SavedJob", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  jobId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [
    { unique: true, fields: ["userId", "jobId"], name: "idx_saved_jobs_user_job" }
  ]
});

// 13. Interview Model
export const Interview = sequelize.define("Interview", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  applicationId: { type: DataTypes.INTEGER, allowNull: false },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  mode: { type: DataTypes.ENUM("Online", "In-Person"), defaultValue: "Online" },
  meetingLink: { type: DataTypes.STRING },
  locationDetails: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("scheduled", "completed", "cancelled"), defaultValue: "scheduled" }
});

// 14. InterviewFeedback Model
export const InterviewFeedback = sequelize.define("InterviewFeedback", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  interviewId: { type: DataTypes.INTEGER, allowNull: false },
  evaluatorId: { type: DataTypes.INTEGER, allowNull: false },
  communicationRating: { type: DataTypes.INTEGER, defaultValue: 3 },
  technicalRating: { type: DataTypes.INTEGER, defaultValue: 3 },
  problemSolvingRating: { type: DataTypes.INTEGER, defaultValue: 3 },
  overallRating: { type: DataTypes.INTEGER, defaultValue: 3 },
  recommendation: { type: DataTypes.ENUM("hire", "reject", "hold"), defaultValue: "hold" },
  feedbackNotes: { type: DataTypes.TEXT }
});

// 15. Notification Model
export const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: "info" },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING }
});

// 16. AuditLog Model
export const AuditLog = sequelize.define("AuditLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING, allowNull: false },
  entity: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.INTEGER },
  previousValue: { type: DataTypes.JSON },
  newValue: { type: DataTypes.JSON },
  ipAddress: { type: DataTypes.STRING },
  userAgent: { type: DataTypes.STRING }
});

// ==========================================
// RELATIONSHIPS & ASSOCIATIONS
// ==========================================

// User <-> Company
User.hasMany(Company, { foreignKey: "userId", as: "companies" });
Company.belongsTo(User, { foreignKey: "userId", as: "owner" });

// Company <-> Job
Company.hasMany(Job, { foreignKey: "companyId", as: "jobs" });
Job.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// Category <-> Job
Category.hasMany(Job, { foreignKey: "categoryId", as: "jobs" });
Job.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// User <-> Job (Created by recruiter/TPO)
User.hasMany(Job, { foreignKey: "createdById", as: "createdJobs" });
Job.belongsTo(User, { foreignKey: "createdById", as: "creator" });

// Job <-> Application
Job.hasMany(Application, { foreignKey: "jobId", as: "applications" });
Application.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// User <-> Application
User.hasMany(Application, { foreignKey: "applicantId", as: "applications" });
Application.belongsTo(User, { foreignKey: "applicantId", as: "applicant" });

// Application <-> ApplicationRound
Application.hasMany(ApplicationRound, { foreignKey: "applicationId", as: "rounds" });
ApplicationRound.belongsTo(Application, { foreignKey: "applicationId", as: "application" });

// PlacementRecord Associations
User.hasMany(PlacementRecord, { foreignKey: "studentId", as: "placementRecords" });
PlacementRecord.belongsTo(User, { foreignKey: "studentId", as: "student" });

Job.hasMany(PlacementRecord, { foreignKey: "driveId", as: "placementRecords" });
PlacementRecord.belongsTo(Job, { foreignKey: "driveId", as: "drive" });

Company.hasMany(PlacementRecord, { foreignKey: "companyId", as: "placementRecords" });
PlacementRecord.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// Many to Many: Job <-> Skill
Job.belongsToMany(Skill, { through: JobSkill, foreignKey: "jobId", as: "skills" });
Skill.belongsToMany(Job, { through: JobSkill, foreignKey: "skillId", as: "jobs" });

// Many to Many: User <-> Skill
User.belongsToMany(Skill, { through: UserSkill, foreignKey: "userId", as: "skills" });
Skill.belongsToMany(User, { through: UserSkill, foreignKey: "skillId", as: "users" });

// Saved Jobs
User.hasMany(SavedJob, { foreignKey: "userId", as: "savedJobs" });
SavedJob.belongsTo(User, { foreignKey: "userId", as: "user" });
Job.hasMany(SavedJob, { foreignKey: "jobId", as: "savedIn" });
SavedJob.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// Interviews & Feedback
Application.hasMany(Interview, { foreignKey: "applicationId", as: "interviews" });
Interview.belongsTo(Application, { foreignKey: "applicationId", as: "application" });

Interview.hasOne(InterviewFeedback, { foreignKey: "interviewId", as: "feedback" });
InterviewFeedback.belongsTo(Interview, { foreignKey: "interviewId", as: "interview" });

// Notifications & Audit Logs
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(AuditLog, { foreignKey: "userId", as: "auditLogs" });
AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });

export { sequelize };
export default {
  User,
  Company,
  Category,
  Job,
  Skill,
  JobSkill,
  UserSkill,
  Application,
  ApplicationRound,
  PlacementRecord,
  PlacementPolicy,
  SavedJob,
  Interview,
  InterviewFeedback,
  Notification,
  AuditLog,
  sequelize
};
