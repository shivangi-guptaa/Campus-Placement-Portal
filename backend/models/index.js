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
  degree: { type: DataTypes.STRING, defaultValue: "MCA" },
  branch: { type: DataTypes.STRING, defaultValue: "Computer Science" },
  cgpa: { type: DataTypes.FLOAT, defaultValue: 8.0 },
  batchYear: { type: DataTypes.INTEGER, defaultValue: 2026 },
  backlogsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  bio: { type: DataTypes.TEXT },
  profilePhoto: { type: DataTypes.STRING },
  resume: { type: DataTypes.STRING },
  resumeOriginalName: { type: DataTypes.STRING },
}, {
  indexes: [
    { unique: true, fields: ["email"] },
    { fields: ["role"] },
    { fields: ["batchYear"] }
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
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [
    { fields: ["userId"] },
    { fields: ["name"] }
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
  salary: { type: DataTypes.INTEGER, allowNull: false }, // CTC in LPA or Stipend
  location: { type: DataTypes.STRING, allowNull: false },
  jobType: {
    type: DataTypes.ENUM("Full-time", "Internship", "PPO"),
    defaultValue: "Full-time"
  },
  experienceLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
  minCgpa: { type: DataTypes.FLOAT, defaultValue: 6.0 },
  batchYear: { type: DataTypes.INTEGER, defaultValue: 2026 },
  branchRequirement: { type: DataTypes.STRING, defaultValue: "All Branches" },
  maxBacklogs: { type: DataTypes.INTEGER, defaultValue: 0 },
  positions: { type: DataTypes.INTEGER, defaultValue: 1 },
  status: { type: DataTypes.ENUM("active", "closed"), defaultValue: "active" },
  companyId: { type: DataTypes.INTEGER, allowNull: false },
  categoryId: { type: DataTypes.INTEGER },
  createdById: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [
    { fields: ["companyId", "status"], name: "idx_job_company_status" },
    { fields: ["categoryId", "location"], name: "idx_job_cat_loc" },
    { fields: ["createdById"] },
    { fields: ["status"] }
  ]
});

// 5. Skill Model
export const Skill = sequelize.define("Skill", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: { type: DataTypes.STRING, defaultValue: "Technical" }
});

// 6. JobSkills Junction Model
export const JobSkill = sequelize.define("JobSkill", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  skillId: { type: DataTypes.INTEGER, allowNull: false },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  indexes: [
    { unique: true, fields: ["jobId", "skillId"] }
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
    { unique: true, fields: ["userId", "skillId"] }
  ]
});

// 8. Application Model
export const Application = sequelize.define("Application", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "reviewing", "shortlisted", "interview_scheduled", "offered", "rejected"),
    defaultValue: "pending"
  },
  coverLetter: { type: DataTypes.TEXT },
  appliedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  indexes: [
    { unique: true, fields: ["jobId", "applicantId"], name: "idx_app_job_applicant" },
    { fields: ["status", "createdAt"], name: "idx_app_status_created" },
    { fields: ["applicantId"] }
  ]
});

// 9. SavedJobs Model
export const SavedJob = sequelize.define("SavedJob", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  jobId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [
    { unique: true, fields: ["userId", "jobId"] }
  ]
});

// 10. Interview Model
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

// 11. InterviewFeedback Model
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

// 12. Notification Model
export const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: "info" },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING }
});

// 13. AuditLog Model
export const AuditLog = sequelize.define("AuditLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING, allowNull: false },
  entity: { type: DataTypes.STRING },
  entityId: { type: DataTypes.INTEGER },
  previousValue: { type: DataTypes.JSON },
  newValue: { type: DataTypes.JSON },
  ipAddress: { type: DataTypes.STRING },
  userAgent: { type: DataTypes.STRING }
});

// Associations
User.hasMany(Company, { foreignKey: "userId", as: "companies" });
Company.belongsTo(User, { foreignKey: "userId", as: "owner" });

Company.hasMany(Job, { foreignKey: "companyId", as: "jobs" });
Job.belongsTo(Company, { foreignKey: "companyId", as: "company" });

Category.hasMany(Job, { foreignKey: "categoryId", as: "jobs" });
Job.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

User.hasMany(Job, { foreignKey: "createdById", as: "postedJobs" });
Job.belongsTo(User, { foreignKey: "createdById", as: "recruiter" });

Job.hasMany(Application, { foreignKey: "jobId", as: "applications" });
Application.belongsTo(Job, { foreignKey: "jobId", as: "job" });

User.hasMany(Application, { foreignKey: "applicantId", as: "applications" });
Application.belongsTo(User, { foreignKey: "applicantId", as: "applicant" });

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
