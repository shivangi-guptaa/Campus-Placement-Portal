# 🎓 SkillSync — University Campus Placement & Internship Management System

A full-stack, enterprise-grade **Campus Placement Management System** designed for universities, colleges, and training & placement cells. The system establishes the **Training & Placement Officer (TPO) as the central authority** while providing streamlined portals for **Recruiters** and **Students**.

---

## 🌟 Key Features & Workflows

### 🛡️ 1. TPO-Centric Central Authority
- **Company Verification Workflow**: Companies registering on the portal start in `PENDING` status and cannot host drives until officially approved by the TPO.
- **Drive Authorization & Publishing**: Recruiter-posted drives are submitted in `PENDING_APPROVAL` status. The TPO verifies eligibility rules and publishes approved drives to eligible students.
- **Official Placement Result Confirmation**: Recruiters submit candidate outcomes to a queue (`PENDING_TPO_CONFIRMATION`). Final placement status and records are confirmed exclusively by the TPO.
- **Institutional Placement Policy Management**: Configurable rules for max offers allowed, allowed placed candidate applications, minimum % CTC increment required, and dream company CTC thresholds.

### 🏢 2. Recruiter Portal
- Post On-Campus Placement Drives and Off-Campus Opportunities.
- View applicant pipelines with automatic eligibility indicators and attached PDF resumes.
- Schedule multi-round recruitment pipelines (Aptitude Assessment, Coding, Technical System Design, HR Interview) with scores and feedback.
- Submit final candidate offers for TPO confirmation.

### 🎓 3. Student Portal
- Tabbed exploration of **TPO-Verified On-Campus Placement Drives** vs **External Off-Campus Opportunities**.
- Backend-enforced institutional eligibility engine (CGPA, active backlogs, eligible branches, passing batch, and placement policy clearance).
- Interactive **Multi-Round Application Progress Portal** tracking round progression, schedules, meeting links, and feedback.
- Placement Status Card on student profile (`NOT_PLACED`, `PLACED`, `MULTIPLE_OFFERS`, `OPTED_OUT`).
- 1-click application withdrawal mechanism.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Lucide Icons, Radix UI / Shadcn UI components.
- **Backend**: Node.js, Express.js (ESM), Sequelize ORM.
- **Database**: MySQL (Production) with smart SQLite fallback for container deployments.
- **Authentication & Security**: JWT (HTTP-only cookie + Bearer Authorization header), Bcryptjs, Helmet, Role-Based Access Control (RBAC).

---

## 🔑 Demo Accounts (Password: `password123`)

| Role | Email | Details |
|---|---|---|
| **TPO Admin (Officer)** | `tpo@demo.com` | Dr. R. K. Kapoor (Head TPO) |
| **Recruiter** | `recruiter@demo.com` | Ananya Roy (Lead HR Partner) |
| **Student (Unplaced)** | `student@demo.com` | Rahul Sharma (CGPA: 8.75) |
| **Student (Placed)** | `priya@demo.com` | Priya Verma (Placed at Microsoft 18 LPA) |
| **Student (Opted-Out)** | `amit@demo.com` | Amit Patel (GATE / Higher Studies Aspirant) |

---

## 🧪 Security & Verification Tests

Run the comprehensive 10-scenario automated verification test suite:
```bash
node backend/test_scenarios.js
```
All 10 critical security scenarios (unapproved company guard, duplicate 409 conflict, eligibility rejection, cross-recruiter isolation, placement policy enforcement, and TPO offer confirmation) pass with 100% success.
