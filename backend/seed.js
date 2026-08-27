import bcrypt from "bcryptjs";
import { connectDB } from "./config/database.js";
import { User, Company, Job, Skill, UserSkill, JobSkill, Application } from "./models/index.js";

export const seedData = async (isStandalone = false) => {
  try {
    await connectDB();

    console.log("Seeding Campus Placement & Internship Database...");

    // Password Hash
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash("password123", salt);

    // 1. Create Diverse Student Users with Real CGPAs
    const studentsData = [
      {
        fullName: "Rahul Sharma",
        email: "student@demo.com",
        phoneNumber: "9876543210",
        password: passHash,
        role: "student",
        degree: "B.Tech",
        branch: "Computer Science",
        cgpa: 8.75,
        batchYear: 2026,
        backlogsCount: 0,
        bio: "Passionate Full Stack Developer & Competitive Programmer eager for campus placement opportunities.",
      },
      {
        fullName: "Priya Verma",
        email: "priya@demo.com",
        phoneNumber: "9811223344",
        password: passHash,
        role: "student",
        degree: "B.Tech",
        branch: "Information Technology",
        cgpa: 9.12,
        batchYear: 2026,
        backlogsCount: 0,
        bio: "AI/ML Enthusiast and Data Structures Ranker (NIT Bhopal).",
      },
      {
        fullName: "Amit Patel",
        email: "amit@demo.com",
        phoneNumber: "9822334455",
        password: passHash,
        role: "student",
        degree: "B.Tech",
        branch: "Electronics & Comm",
        cgpa: 7.60,
        batchYear: 2026,
        backlogsCount: 0,
        bio: "Embedded Systems & Cloud Computing Developer.",
      },
      {
        fullName: "Sneha Gupta",
        email: "sneha@demo.com",
        phoneNumber: "9833445566",
        password: passHash,
        role: "student",
        degree: "MCA",
        branch: "Computer Science",
        cgpa: 8.40,
        batchYear: 2026,
        backlogsCount: 0,
        bio: "Frontend React Engineer & UI/UX Specialist.",
      },
      {
        fullName: "Vikram Singh",
        email: "vikram@demo.com",
        phoneNumber: "9844556677",
        password: passHash,
        role: "student",
        degree: "B.Tech",
        branch: "Electrical Engg",
        cgpa: 6.85,
        batchYear: 2026,
        backlogsCount: 1,
        bio: "Backend Systems Developer exploring Node.js and MySQL microservices.",
      },
    ];

    const createdStudents = [];
    for (const s of studentsData) {
      const [u] = await User.findOrCreate({
        where: { email: s.email },
        defaults: s,
      });
      // Update CGPA explicitly in case record existed
      await u.update({ cgpa: s.cgpa, branch: s.branch, degree: s.degree });
      createdStudents.push(u);
    }

    const [recruiter] = await User.findOrCreate({
      where: { email: "recruiter@demo.com" },
      defaults: {
        fullName: "Ananya Roy (HR Manager)",
        email: "recruiter@demo.com",
        phoneNumber: "9123456789",
        password: passHash,
        role: "recruiter",
        bio: "Campus Lead Talent Acquisition Partner at Microsoft & Amazon India.",
      },
    });

    const [tpoAdmin] = await User.findOrCreate({
      where: { email: "tpo@demo.com" },
      defaults: {
        fullName: "Dr. R. K. Kapoor (Head TPO)",
        email: "tpo@demo.com",
        phoneNumber: "9988776655",
        password: passHash,
        role: "tpo_admin",
        bio: "Head of Training & Placement Cell, MANIT / NIT Bhopal.",
      },
    });

    // 2. Create Primary Placement Skills
    const skillList = ["React", "Node.js", "MySQL", "JavaScript", "Python", "Java", "C++", "AWS", "Docker", "Tailwind CSS"];
    const skillObjs = [];
    for (const sName of skillList) {
      const [sk] = await Skill.findOrCreate({ where: { name: sName } });
      skillObjs.push(sk);
    }

    // Attach Skills to Students
    await createdStudents[0].addSkill(skillObjs[0], { through: { proficiency: "Expert" } }); // React
    await createdStudents[0].addSkill(skillObjs[1], { through: { proficiency: "Expert" } }); // Node.js
    await createdStudents[0].addSkill(skillObjs[2], { through: { proficiency: "Intermediate" } }); // MySQL
    await createdStudents[1].addSkill(skillObjs[4], { through: { proficiency: "Expert" } }); // Python
    await createdStudents[2].addSkill(skillObjs[5], { through: { proficiency: "Intermediate" } }); // Java

    // 3. Create Companies
    const companiesData = [
      {
        name: "Google Cloud India",
        description: "Google Cloud Platform engineering division empowering global enterprise infrastructure and AI solutions.",
        website: "https://cloud.google.com",
        location: "Bengaluru",
        industry: "Information Technology",
        userId: recruiter.id,
      },
      {
        name: "Microsoft India Development Center",
        description: "Leading tech giant driving Azure cloud services, Developer Tools, and AI Innovation globally.",
        website: "https://microsoft.com",
        location: "Hyderabad",
        industry: "Information Technology",
        userId: recruiter.id,
      },
      {
        name: "Zomato Tech",
        description: "India's premier food ordering & hyper-local delivery logistics platform with high-scale microservices.",
        website: "https://zomato.com",
        location: "Gurugram",
        industry: "E-Commerce",
        userId: recruiter.id,
      },
      {
        name: "Amazon Development Center",
        description: "Global e-commerce and cloud computing pioneer powering AWS infrastructure and logistics technologies.",
        website: "https://amazon.jobs",
        location: "Bengaluru",
        industry: "Cloud & E-Commerce",
        userId: recruiter.id,
      },
      {
        name: "Flipkart Tech",
        description: "India's leading e-commerce ecosystem driving high-frequency supply chain and recommendation algorithms.",
        website: "https://flipkart.com",
        location: "Bengaluru",
        industry: "E-Commerce",
        userId: recruiter.id,
      },
    ];

    const createdCompanies = [];
    for (const c of companiesData) {
      const [comp] = await Company.findOrCreate({
        where: { name: c.name },
        defaults: c,
      });
      createdCompanies.push(comp);
    }

    // 4. Create Placement Drives (Jobs)
    const placementDrives = [
      {
        title: "Software Development Engineer - I (SDE-1)",
        description: "Join Google Cloud's core infrastructure team. Responsible for designing scalable microservices, backend REST APIs, and database architecture.",
        requirements: "B.Tech / MCA 2026 Batch. Minimum 7.5 CGPA required. Strong proficiency in Data Structures, Algorithms, and System Design.",
        salary: 28,
        location: "Bengaluru",
        jobType: "Full-time",
        minCgpa: 7.5,
        batchYear: 2026,
        positions: 5,
        companyId: createdCompanies[0].id,
        createdById: recruiter.id,
        skillsToAttach: ["Node.js", "MySQL", "C++", "AWS"],
      },
      {
        title: "Frontend Engineering Intern (React / Next.js)",
        description: "Build sleek user interfaces and intuitive frontend web experiences for Microsoft Azure Cloud Console.",
        requirements: "Students passing out in 2026 with no active backlogs. Proficiency in React.js, JavaScript (ES6+), and Responsive Web Design.",
        salary: 18,
        location: "Hyderabad",
        jobType: "Internship",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 8,
        companyId: createdCompanies[1].id,
        createdById: recruiter.id,
        skillsToAttach: ["React", "JavaScript", "Tailwind CSS", "Git"],
      },
      {
        title: "Full Stack Engineer (MERN / MySQL)",
        description: "Build robust full-stack features for Zomato's merchant and customer platform. Opportunity to scale APIs handling millions of requests.",
        requirements: "Strong background in React, Node.js, Express, and Relational Databases (MySQL). Minimum 7.0 CGPA.",
        salary: 14,
        location: "Gurugram",
        jobType: "PPO",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 4,
        companyId: createdCompanies[2].id,
        createdById: recruiter.id,
        skillsToAttach: ["Node.js", "React", "MySQL", "JavaScript"],
      },
      {
        title: "Cloud Infrastructure & DevOps Engineer",
        description: "Manage distributed cloud architecture, Docker containers, and CI/CD deployment pipelines for Amazon Web Services.",
        requirements: "B.Tech 2026 Batch (CS/IT/ECE). Minimum 7.2 CGPA. Hands-on experience with Linux, AWS, Docker, and shell scripting.",
        salary: 22,
        location: "Bengaluru",
        jobType: "Full-time",
        minCgpa: 7.2,
        batchYear: 2026,
        positions: 6,
        companyId: createdCompanies[3].id,
        createdById: recruiter.id,
        skillsToAttach: ["AWS", "Docker", "Node.js", "Python"],
      },
      {
        title: "Backend Systems Developer (Java / Spring)",
        description: "Develop resilient high-throughput transaction processing systems for Flipkart's core payment and catalog engines.",
        requirements: "Strong Java/C++ fundamentals, object-oriented design, and relational database management systems. Min 7.0 CGPA.",
        salary: 20,
        location: "Bengaluru",
        jobType: "Full-time",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 7,
        companyId: createdCompanies[4].id,
        createdById: recruiter.id,
        skillsToAttach: ["Java", "MySQL", "Node.js", "C++"],
      },
    ];

    for (const driveData of placementDrives) {
      const { skillsToAttach, ...driveFields } = driveData;
      const [driveObj] = await Job.findOrCreate({
        where: { title: driveFields.title, companyId: driveFields.companyId },
        defaults: driveFields,
      });

      for (const skName of skillsToAttach) {
        const sk = skillObjs.find((s) => s.name === skName);
        if (sk) {
          await JobSkill.findOrCreate({
            where: { jobId: driveObj.id, skillId: sk.id },
            defaults: { isPrimary: true },
          });
        }
      }

      // Seed applications
      for (const stud of createdStudents.slice(0, 3)) {
        await Application.findOrCreate({
          where: { jobId: driveObj.id, applicantId: stud.id },
          defaults: {
            status: "shortlisted",
            coverLetter: "Extremely excited about this opportunity! I have strong proficiency in React and Node.js.",
          },
        });
      }
    }

    console.log("Database Seeded Successfully!");
    console.log("-----------------------------------------");
    console.log("Demo Student Accounts with Diverse CGPAs:");
    console.log("1. Rahul Sharma (student@demo.com) | CGPA: 8.75");
    console.log("2. Priya Verma  (priya@demo.com)   | CGPA: 9.12");
    console.log("3. Amit Patel   (amit@demo.com)    | CGPA: 7.60");
    console.log("4. Sneha Gupta  (sneha@demo.com)   | CGPA: 8.40");
    console.log("5. Vikram Singh (vikram@demo.com)  | CGPA: 6.85");
    console.log("-----------------------------------------");

    if (isStandalone) {
      process.exit(0);
    }
  } catch (err) {
    console.error("Seed Failed:", err);
    if (isStandalone) {
      process.exit(1);
    }
  }
};

// Run standalone if executed directly via node backend/seed.js
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("seed.js")) {
  seedData(true);
}
