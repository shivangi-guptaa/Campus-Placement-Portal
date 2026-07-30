# 🎓 SkillSync: Enterprise Campus Placement & Internship Management System

A production-grade **University Campus Placement & Internship Management Engine** built with **Node.js, Express.js, Sequelize ORM, MySQL 8.0, and React**.

Featuring **13 Normalized Relational MySQL Tables**, **Automated Campus Eligibility Engine**, **Weighted Skill Recommendation Algorithm**, **Raw SQL Analytics (Window Functions & CTEs)**, **Swagger OpenAPI Docs**, and **Sequelize Managed Transactions**.

---

## 🛠️ System Architecture & Database ER Diagram

```mermaid
erDiagram
    Users ||--o{ Companies : "manages"
    Users ||--o{ Applications : "submits"
    Users ||--o{ SavedJobs : "bookmarks"
    Users ||--o{ Notifications : "receives"
    Users ||--o{ UserSkills : "possesses"
    Users ||--o{ AuditLogs : "audits"
    Companies ||--o{ Jobs : "posts_drives"
    Jobs ||--o{ Applications : "receives"
    Jobs ||--o{ JobSkills : "requires"
    Jobs ||--o{ SavedJobs : "bookmarked_in"
    Jobs }|--|| Categories : "belongs_to"
    Skills ||--o{ JobSkills : "linked"
    Skills ||--o{ UserSkills : "linked"
    Applications ||--o{ Interviews : "schedules"
    Interviews ||--o{ InterviewFeedbacks : "evaluates"
```

---

## 🌟 Key Features

### 1. 🎓 Campus Eligibility Engine
Automated eligibility checker validating:
- **Minimum CGPA Threshold**
- **Graduation Batch & Stream / Branch Compatibility**
- **Maximum Active Backlogs Count**
- **Required Primary Tech Skills**
Provides real-time checklist breakdown with pass/fail reasons (e.g. `❌ Required CGPA: 8.0 (Your CGPA: 7.4)`).

### 2. ⚡ Multi-Factor Weighted Skill Recommendation Scoring
Matches candidate profiles against active placement drives using weighted formula:
$$\text{Score} = (50\% \times \text{Primary Skills}) + (20\% \times \text{Skill Proficiency}) + (15\% \times \text{CGPA}) + (10\% \times \text{Location}) + (5\% \times \text{Drive Type})$$
Returns granular skill match breakdown: `React: 90%`, `Node.js: 100%`, `MySQL: 100%`, `Docker: 0%`.

### 3. 📊 Raw SQL Analytics (Window Functions & CTEs)
- **TPO Admin Dashboard**: Total Placed Students, Average Package (LPA), Highest Package (LPA), Placement Conversion Funnel, Top Demanded Skills.
- **MySQL Window Functions**: `ROW_NUMBER() OVER(PARTITION BY companyId ORDER BY salary DESC)` to compute top package rankings per company.
- **Common Table Expressions (CTEs)**: `WITH DailyStats AS (...)` to track application trends over time.

### 4. 🔒 Concurrency-Safe DB Transactions & Security
- **Atomic Transactions**: Application submission wraps operations in `sequelize.transaction()` to prevent partial DB writes and race conditions.
- **Duplicate Prevention**: Composite unique indexes `(jobId, applicantId)`.
- **API Security**: `helmet` security headers, CORS protection, `express-rate-limit`, structured `winston` logging.
- **Swagger Documentation**: Interactive Swagger UI available live at `/api-docs`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher
- **MySQL 8.0**: Installed and running on port 3306

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shivangi-guptaa/Campus-Placement-Portal.git
   cd Campus-Placement-Portal
   ```

2. **Install Dependencies**
   ```bash
   # Install Backend Dependencies
   npm install

   # Install Frontend Dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory with your MySQL credentials:
   ```env
   PORT=8000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=placement_portal
   DB_DIALECT=mysql
   JWT_SECRET=supersecretjwtkey123
   ```

4. **Seed Database**
   Automatically creates database `placement_portal`, syncs 13 tables, and seeds sample data:
   ```bash
   npm run seed
   ```

5. **Start Application**
   ```bash
   # Start Backend (Port 8000)
   npm run dev

   # Start Frontend in separate terminal (Port 5173)
   cd frontend
   npm run dev
   ```

6. **Access Points**
   - **Web Application**: `http://localhost:5173`
   - **Swagger API Docs**: `http://localhost:8000/api-docs`

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `password123` | View eligibility, skill match scores, apply to drives, track applications |
| **Recruiter** | `recruiter@demo.com` | `password123` | Post placement drives, review applicants, schedule interviews |
| **TPO Admin** | `tpo@demo.com` | `password123` | Access TPO Placement Analytics, SQL ranking reports, company management |
