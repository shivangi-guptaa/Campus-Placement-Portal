import bcrypt from "bcryptjs";
import { connectDB } from "./config/database.js";
import { User, Company, Job, Skill, UserSkill, JobSkill, Application } from "./models/index.js";

const seedData = async () => {
  try {
    await connectDB();

    console.log("Seeding Campus Placement & Internship Database...");

    // Password Hash
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash("password123", salt);

    // 1. Create Users (Student, Recruiter, TPO Admin)
    const [student] = await User.findOrCreate({
      where: { email: "student@demo.com" },
      defaults: {
        fullName: "Rahul Sharma",
        email: "student@demo.com",
        phoneNumber: "9876543210",
        password: passHash,
        role: "student",
        degree: "MCA",
        branch: "Computer Science",
        cgpa: 8.5,
        batchYear: 2026,
        backlogsCount: 0,
        bio: "Passionate Full Stack Developer & Competitive Programmer eager for campus placement opportunities.",
      },
    });

    const [recruiter] = await User.findOrCreate({
      where: { email: "recruiter@demo.com" },
      defaults: {
        fullName: "Ananya Roy (HR Manager)",
        email: "recruiter@demo.com",
        phoneNumber: "9123456789",
        password: passHash,
        role: "recruiter",
        degree: "B.Tech",
        branch: "IT",
        cgpa: 9.0,
        batchYear: 2024,
      },
    });

    const [tpoAdmin] = await User.findOrCreate({
      where: { email: "tpo@demo.com" },
      defaults: {
        fullName: "Prof. V. K. Gupta (Head TPO)",
        email: "tpo@demo.com",
        phoneNumber: "9988776655",
        password: passHash,
        role: "tpo_admin",
        degree: "Ph.D.",
        branch: "Computer Science",
      },
    });

    // 2. Seed Skills
    const skillsList = [
      "JavaScript", "React", "Node.js", "Python", "MySQL", "Java", 
      "C++", "Data Structures", "Docker", "AWS", "Git", "Tailwind CSS"
    ];

    const skillObjs = [];
    for (const name of skillsList) {
      const [sk] = await Skill.findOrCreate({ where: { name } });
      skillObjs.push(sk);
    }

    // Tag skills to student
    for (let i = 0; i < 6; i++) {
      await UserSkill.findOrCreate({
        where: { userId: student.id, skillId: skillObjs[i].id },
        defaults: { proficiency: i % 2 === 0 ? "Expert" : "Intermediate" },
      });
    }

    // 3. Create Companies
    const companies = [
      { name: "Google India", location: "Bangalore", website: "https://careers.google.com", industry: "Tech / Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
      { name: "Microsoft Corporation", location: "Hyderabad", website: "https://careers.microsoft.com", industry: "Software / AI", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
      { name: "Zomato", location: "Gurugram", website: "https://zomato.com", industry: "E-Commerce / FoodTech", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg" },
      { name: "Amazon India", location: "Bengaluru", website: "https://amazon.jobs", industry: "Cloud / Logistics", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    ];

    const createdCompanies = [];
    for (const c of companies) {
      const [comp] = await Company.findOrCreate({
        where: { name: c.name },
        defaults: { ...c, userId: recruiter.id },
      });
      createdCompanies.push(comp);
    }

    // 4. Create Placement Drives
    const placementDrives = [
      {
        title: "Software Development Engineer - I (SDE-1)",
        description: "Join Google India's Core Engineering team working on large-scale distributed systems, search performance, and cloud microservices.",
        requirements: "Solid proficiency in Data Structures, Algorithms, JavaScript, Node.js, and MySQL. Minimum 7.5 CGPA required.",
        salary: 18, // 18 LPA
        location: "Bangalore",
        jobType: "Full-time",
        minCgpa: 7.5,
        batchYear: 2026,
        positions: 5,
        companyId: createdCompanies[0].id,
        createdById: recruiter.id,
        skillsToAttach: ["JavaScript", "Node.js", "MySQL", "Data Structures"],
      },
      {
        title: "Frontend React Developer (Campus Internship)",
        description: "6-month campus internship with PPO conversion. Build high performance web applications using React, Redux Toolkit, and Tailwind CSS.",
        requirements: "Hands-on experience with React, JavaScript, CSS, HTML. Minimum 6.5 CGPA.",
        salary: 4, // 4 LPA / Stipend 35k/mo
        location: "Hyderabad",
        jobType: "Internship",
        minCgpa: 6.5,
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
        salary: 14, // 14 LPA
        location: "Gurugram",
        jobType: "PPO",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 4,
        companyId: createdCompanies[2].id,
        createdById: recruiter.id,
        skillsToAttach: ["Node.js", "React", "MySQL", "JavaScript"],
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

      // Seed application
      await Application.findOrCreate({
        where: { jobId: driveObj.id, applicantId: student.id },
        defaults: {
          status: "shortlisted",
          coverLetter: "Extremely excited about this opportunity! I have strong proficiency in React and Node.js.",
        },
      });
    }

    console.log("Database Seeded Successfully!");
    console.log("-----------------------------------------");
    console.log("Demo Credentials:");
    console.log("Student Account:    student@demo.com   | Password: password123");
    console.log("Recruiter Account:  recruiter@demo.com | Password: password123");
    console.log("TPO Admin Account:  tpo@demo.com       | Password: password123");
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Seed Failed:", err);
    process.exit(1);
  }
};

seedData();
