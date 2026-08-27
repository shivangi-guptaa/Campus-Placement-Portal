# 🎓 SkillSync — Campus Placement & Internship Management Portal

A full-stack campus placement and internship management application built with **Node.js, Express.js, Sequelize ORM, MySQL/SQLite, and React 19**.

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Vercel-black?style=flat-square&logo=vercel)](https://campus-placement-portal-orcin.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-blue?style=flat-square&logo=render)](https://campus-placement-portal-f3ot.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-shivangi--guptaa-gray?style=flat-square&logo=github)](https://github.com/shivangi-guptaa/Campus-Placement-Portal)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [campus-placement-portal-orcin.vercel.app](https://campus-placement-portal-orcin.vercel.app) |
| ⚙️ Backend API | [campus-placement-portal-f3ot.onrender.com](https://campus-placement-portal-f3ot.onrender.com) |

> **Note:** Backend is on Render free tier — first request may take 30–60 seconds to wake up.

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🎓 **Student** | `student@demo.com` | `password123` |
| 🏢 **Recruiter** | `recruiter@demo.com` | `password123` |
| 🛡️ **TPO Admin** | `tpo@demo.com` | `password123` |

---

## ✨ Features

### 👨‍🎓 Students
- Register with email OTP verification & password strength checklist
- Apply to placement drives with real-time eligibility check (CGPA, branch, batch, backlogs)
- Track application status (Pending → Shortlisted → Interview Scheduled → Offered)
- View skill-match recommendation scores per drive
- Upload PDF resume, manage profile

### 🏢 Recruiters
- Post placement drives with custom eligibility criteria and job role dropdown
- View applicants with CGPA, branch, eligibility badge & resume PDF link
- Update applicant status (Shortlisted / Interview Scheduled / Offered / Rejected)

### 🛡️ TPO Admins
- Placement analytics dashboard (MySQL window functions, CTEs)
- Placement calendar with interactive drive timeline modal
- Company management (name, description, website, location, logo)
- Manage all drives & companies

### 🔒 Security & Auth
- JWT-based authentication (access + refresh tokens)
- Email OTP verification on registration & password reset (Nodemailer / Gmail SMTP)
- bcrypt password hashing
- Helmet security headers, Winston structured logging, CORS protection
- Concurrency-safe applications using `sequelize.transaction()`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS, shadcn/ui (Radix UI), Redux Toolkit |
| **Backend** | Node.js, Express.js |
| **ORM** | Sequelize 6 |
| **Database** | MySQL 8.0 (local/production) / SQLite (auto-fallback) |
| **Auth** | JWT, bcryptjs |
| **Email** | Nodemailer (Gmail SMTP) |
| **File Upload** | Multer, Cloudinary |
| **Logging** | Winston |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🗄️ Database ER Diagram

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

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MySQL 8.0 *(optional — SQLite is used automatically if MySQL is not configured)*

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shivangi-guptaa/Campus-Placement-Portal.git
cd Campus-Placement-Portal

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Create .env file in root (see variables below)

# 4. Seed database with sample data
npm run seed

# 5. Start backend (port 8000)
npm run dev

# 6. In a new terminal, start frontend (port 5173)
cd frontend && npm run dev
```

### Environment Variables (`.env`)

```env
PORT=8000

# MySQL (optional — SQLite auto-used if not set)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Email OTP (optional — OTP delivery skipped if not set)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password

# Cloudinary (optional — local storage used if not set)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Docker

```bash
docker-compose up --build
```

---

## ☁️ Production Deployment

### Frontend → Vercel
1. Go to [vercel.com/new](https://vercel.com/new) → Import `shivangi-guptaa/Campus-Placement-Portal`
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Deploy ✅

### Backend → Render
1. Go to [dashboard.render.com](https://dashboard.render.com) → New Web Service
2. Connect `shivangi-guptaa/Campus-Placement-Portal`
3. **Build Command**: `npm install`
4. **Start Command**: `node backend/index.js`
5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `PORT` | `8000` |
| `JWT_SECRET` | *(any random secret string)* |
| `EMAIL_USER` | *(your Gmail address — optional)* |
| `EMAIL_PASS` | *(16-digit Gmail App Password — optional)* |
| `DB_HOST` | *(external MySQL host — optional)* |
| `DB_USER` | *(MySQL username — optional)* |
| `DB_PASSWORD` | *(MySQL password — optional)* |

> 💡 If MySQL env vars are **not set**, the backend automatically uses **SQLite** — no extra setup needed for basic testing.

---

## 👩‍💻 Developer

**Shivangi Gupta** — NIT Bhopal

[![LinkedIn](https://img.shields.io/badge/LinkedIn-shivangi--gupta--nitbhopal-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/shivangi-gupta-nitbhopal)
[![GitHub](https://img.shields.io/badge/GitHub-shivangi--guptaa-gray?style=flat-square&logo=github)](https://github.com/shivangi-guptaa)
