# 🎓 SkillSync: Campus Placement & Internship Management System

A full-stack campus placement and internship management application built using **Node.js, Express.js, Sequelize ORM, MySQL 8.0, and React**.

Built with **13 normalized relational tables**, **automated eligibility evaluation**, **skill match recommendation algorithm**, **raw SQL analytics**, **Swagger API documentation**, and **concurrency-safe database transactions**.

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

## 🌟 Architecture & Features

### 1. 🎓 Campus Eligibility Engine
- Validates student **CGPA**, **Graduation Batch**, **Branch**, **Active Backlogs**, and **Primary Skills**.
- Generates real-time pass/fail checklist evaluation on drive details page.

### 2. ⚡ Skill Match Recommendation Engine
- Calculates candidate match scores based on primary skills, skill proficiency levels, CGPA eligibility, and location.
- Provides skill-by-skill match breakdown (`React: 90%`, `Node.js: 100%`, `MySQL: 100%`).

### 3. 📊 Raw SQL Analytics
- **MySQL Window Functions**: `ROW_NUMBER() OVER(PARTITION BY companyId ORDER BY salary DESC)` to rank top package offers per company.
- **Common Table Expressions (CTEs)**: `WITH DailyStats AS (...)` to analyze daily application velocity.
- **TPO Admin Dashboard**: Placement conversion funnel, placed student metrics, and top requested skills.

### 4. 🔒 Concurrency-Safe Database Transactions & Security
- Applications use `sequelize.transaction()` to guarantee atomic state updates.
- Composite unique indexes `(jobId, applicantId)` prevent duplicate drive applications.
- Integrated `helmet` security headers, `express-rate-limit`, structured `winston` logging, and interactive `Swagger / OpenAPI 3.0` documentation.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher
- **MySQL 8.0**: Installed and running on port 3306 (or via Docker)

### Option A: Local Run

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
   Create a `.env` file in the root directory:
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
   Creates the `placement_portal` database, syncs 13 tables, and seeds sample data:
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

### Option B: Run via Docker Compose

```bash
docker-compose up --build
```

---

## 🔗 Access Points & API Docs

- **Web Application**: `http://localhost:5173`
- **Swagger API Docs**: `http://localhost:8000/api-docs`

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `password123` | View eligibility, skill match scores, apply to drives, track applications |
| **Recruiter** | `recruiter@demo.com` | `password123` | Post placement drives, review applicants, schedule interviews |
| **TPO Admin** | `tpo@demo.com` | `password123` | Access TPO Placement Analytics, SQL ranking reports, company management |
