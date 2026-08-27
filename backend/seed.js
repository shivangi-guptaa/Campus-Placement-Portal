import bcrypt from "bcryptjs";
import { connectDB } from "./config/database.js";
import { User, Company, Job, Skill, UserSkill, JobSkill, Application, ApplicationRound, PlacementRecord, PlacementPolicy } from "./models/index.js";

/**
 * Enterprise Demo Seed Data for Campus Placement Management System
 * Uses realistic, distinguishable enterprise IT & consulting demo companies.
 */
export const seedData = async (isStandalone = false) => {
  try {
    await connectDB();

    console.log("Seeding Campus Placement Database with Realistic Demo Companies...");

    // Password Hash
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash("password123", salt);

    // 0. Seed Default Institutional Placement Policy
    const [policy] = await PlacementPolicy.findOrCreate({
      where: { isActive: true },
      defaults: {
        name: "NIT Bhopal Official Campus Placement Policy",
        maxOffersAllowed: 1,
        allowPlacedStudentsToApply: false,
        minCtcIncreasePercentage: 50.0,
        dreamCompanyMinCtc: 10.0,
        isActive: true,
      },
    });
    await policy.update({
      maxOffersAllowed: 1,
      allowPlacedStudentsToApply: false,
      minCtcIncreasePercentage: 50.0,
      dreamCompanyMinCtc: 10.0,
      isActive: true,
    });

    // 1. Create Recruiter & TPO Admin Users
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

    const [recruiter] = await User.findOrCreate({
      where: { email: "recruiter@demo.com" },
      defaults: {
        fullName: "Ananya Roy (Campus Talent Acquisition Lead)",
        email: "recruiter@demo.com",
        phoneNumber: "9123456789",
        password: passHash,
        role: "recruiter",
        bio: "Campus Lead Talent Acquisition Partner for Enterprise IT.",
      },
    });

    // 2. Create 10 Realistic, Distinct Demo Companies
    const demoCompaniesData = [
      {
        name: "Infosys",
        description: "Global leader in next-generation digital services and consulting, enabling clients across 56 countries to navigate their digital transformation.",
        website: "https://www.infosys.com",
        location: "Bengaluru",
        industry: "Information Technology & Consulting",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-05"),
        userId: recruiter.id,
      },
      {
        name: "Tata Consultancy Services",
        description: "Leading global IT services, consulting, and business solutions organization partnering with many of the world's largest businesses.",
        website: "https://www.tcs.com",
        location: "Mumbai",
        industry: "Information Technology",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-08"),
        userId: recruiter.id,
      },
      {
        name: "Wipro",
        description: "Leading technology services and consulting company focused on building innovative solutions that address clients' most complex digital transformation needs.",
        website: "https://www.wipro.com",
        location: "Bengaluru",
        industry: "Information Technology & Cloud",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-10"),
        userId: recruiter.id,
      },
      {
        name: "Accenture",
        description: "Global professional services company with leading capabilities in digital, cloud, and security across more than 40 industries.",
        website: "https://www.accenture.com",
        location: "Gurugram",
        industry: "Management Consulting & Technology",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-12"),
        userId: recruiter.id,
      },
      {
        name: "Capgemini",
        description: "Global leader in partnering with companies to transform and manage their business by harnessing the power of technology.",
        website: "https://www.capgemini.com",
        location: "Pune",
        industry: "Consulting & Technology Services",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-15"),
        userId: recruiter.id,
      },
      {
        name: "Cognizant",
        description: "One of the world's leading professional services companies, transforming clients' business, operating, and technology models for the digital era.",
        website: "https://www.cognizant.com",
        location: "Chennai",
        industry: "Information Technology & Digital",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-18"),
        userId: recruiter.id,
      },
      {
        name: "Deloitte",
        description: "Global provider of audit and assurance, consulting, financial advisory, risk advisory, tax, and related services.",
        website: "https://www.deloitte.com",
        location: "Hyderabad",
        industry: "Consulting & Financial Advisory",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-20"),
        userId: recruiter.id,
      },
      {
        name: "IBM",
        description: "Global cloud platform and cognitive solutions company, leading innovations in hybrid cloud, artificial intelligence, and quantum computing.",
        website: "https://www.ibm.com",
        location: "Bengaluru",
        industry: "Cloud & Enterprise Software",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-22"),
        userId: recruiter.id,
      },
      {
        name: "Amazon",
        description: "Global technology company focusing on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.",
        website: "https://www.amazon.jobs",
        location: "Bengaluru",
        industry: "Cloud Computing & E-Commerce",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-25"),
        userId: recruiter.id,
      },
      {
        name: "Microsoft",
        description: "Global technology leader creating platforms and tools powered by AI to deliver innovative solutions in cloud, enterprise, and productivity software.",
        website: "https://careers.microsoft.com",
        location: "Hyderabad",
        industry: "Software & Cloud Solutions",
        status: "APPROVED",
        isApproved: true,
        approvedById: tpoAdmin.id,
        approvedAt: new Date("2026-01-28"),
        userId: recruiter.id,
      },
    ];

    const companiesMap = {};
    for (const c of demoCompaniesData) {
      const [comp] = await Company.findOrCreate({
        where: { name: c.name },
        defaults: c,
      });
      await comp.update({
        description: c.description,
        website: c.website,
        location: c.location,
        industry: c.industry,
        status: c.status,
        isApproved: c.isApproved,
        approvedById: c.approvedById,
        approvedAt: c.approvedAt,
        userId: c.userId,
      });
      companiesMap[c.name] = comp;
    }

    // 3. Create Student Users with Real Placement Statuses
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
        placementStatus: "NOT_PLACED",
        currentPackage: 0.00,
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
        placementStatus: "PLACED",
        currentPackage: 18.00,
        placedCompanyName: "Microsoft",
        placedDate: new Date("2026-02-15"),
        bio: "AI/ML Enthusiast and Data Structures Ranker (NIT Bhopal). Placed at Microsoft.",
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
        placementStatus: "OPTED_OUT",
        currentPackage: 0.00,
        bio: "Higher Studies / GATE Aspirant. Opted out of campus placements.",
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
        placementStatus: "NOT_PLACED",
        currentPackage: 0.00,
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
        placementStatus: "NOT_PLACED",
        currentPackage: 0.00,
        bio: "Backend Systems Developer exploring Node.js and MySQL microservices.",
      },
    ];

    const createdStudents = [];
    for (const s of studentsData) {
      const [u] = await User.findOrCreate({
        where: { email: s.email },
        defaults: s,
      });
      await u.update({
        fullName: s.fullName,
        phoneNumber: s.phoneNumber,
        cgpa: s.cgpa,
        branch: s.branch,
        degree: s.degree,
        placementStatus: s.placementStatus,
        currentPackage: s.currentPackage,
        placedCompanyName: s.placedCompanyName || null,
        placedDate: s.placedDate || null,
      });
      createdStudents.push(u);
    }

    // 4. Create Skills
    const skillList = ["React", "Node.js", "MySQL", "JavaScript", "Python", "Java", "C++", "AWS", "Docker", "Tailwind CSS"];
    const skillObjs = [];
    for (const sName of skillList) {
      const [sk] = await Skill.findOrCreate({ where: { name: sName } });
      skillObjs.push(sk);
    }

    // 5. Create Realistic Placement Drives Mapped to Canonical Companies
    const placementDrives = [
      {
        title: "Systems Engineer Trainee",
        companyName: "Infosys",
        description: "Join Infosys Digital Specialist Engineer stream. Work on enterprise Java microservices, cloud deployments, and agile software development.",
        requirements: "B.Tech / MCA 2026 Batch. Minimum 6.5 CGPA. Knowledge of Java, SQL, and Object-Oriented Design.",
        salary: 9,
        packageMin: 8.00,
        packageMax: 9.50,
        ctc: 9.00,
        location: "Bengaluru / Pune",
        jobType: "Full-time",
        driveType: "ON_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 6.5,
        batchYear: 2026,
        positions: 25,
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        skillsToAttach: ["Java", "MySQL", "JavaScript"],
      },
      {
        title: "Digital Software Developer (TCS Digital)",
        companyName: "Tata Consultancy Services",
        description: "TCS Digital flagship campus hiring. Work on cutting-edge technologies including IoT, Cloud Engineering, Big Data, and AI applications.",
        requirements: "2026 Batch CS/IT/ECE. Minimum 7.0 CGPA with no active backlogs. Strong algorithmic and coding skills.",
        salary: 8,
        packageMin: 7.50,
        packageMax: 8.50,
        ctc: 8.00,
        location: "Pan-India",
        jobType: "Full-time",
        driveType: "ON_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 20,
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        skillsToAttach: ["Python", "Java", "Node.js", "Docker"],
      },
      {
        title: "Cloud Application Developer",
        companyName: "Accenture",
        description: "Design and implement scalable full-stack web applications on cloud infrastructure for Fortune 500 enterprise clients.",
        requirements: "B.Tech / MCA 2026 Batch. Minimum 6.8 CGPA. Hands-on experience with React, Node.js, and RESTful APIs.",
        salary: 11,
        packageMin: 9.50,
        packageMax: 11.00,
        ctc: 11.00,
        location: "Gurugram / Hyderabad",
        jobType: "Full-time",
        driveType: "ON_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 6.8,
        batchYear: 2026,
        positions: 15,
        applicationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
        skillsToAttach: ["React", "Node.js", "AWS", "MySQL"],
      },
      {
        title: "Software Development Engineer - I (SDE-1)",
        companyName: "Amazon",
        description: "Join Amazon Web Services (AWS) or Retail Core platform teams. Build high-scale distributed systems handling millions of transactions per second.",
        requirements: "B.Tech / MCA 2026 Batch. Minimum 7.5 CGPA. Strong Data Structures, Algorithms, and System Design.",
        salary: 28,
        packageMin: 24.00,
        packageMax: 28.00,
        ctc: 28.00,
        location: "Bengaluru / Hyderabad",
        jobType: "Full-time",
        driveType: "ON_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 7.5,
        batchYear: 2026,
        positions: 6,
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        skillsToAttach: ["Java", "C++", "AWS", "Docker"],
      },
      {
        title: "Frontend Engineering Intern (Azure Tools)",
        companyName: "Microsoft",
        description: "Develop interactive web applications, developer SDKs, and cloud dashboards for Microsoft Azure Developer Division.",
        requirements: "Graduating batch 2026. Minimum 7.0 CGPA. Proficiency with React, TypeScript, and modern CSS architecture.",
        salary: 18,
        packageMin: 15.00,
        packageMax: 18.00,
        ctc: 18.00,
        location: "Hyderabad",
        jobType: "Internship",
        driveType: "ON_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 8,
        applicationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        skillsToAttach: ["React", "JavaScript", "Tailwind CSS"],
      },
      {
        title: "Technology Analyst (Consulting Advisory)",
        companyName: "Deloitte",
        description: "Consulting advisory role assessing enterprise architecture, data management, and cybersecurity implementations.",
        requirements: "B.Tech All Branches. Minimum 7.0 CGPA. Strong analytical and communication skills.",
        salary: 12,
        packageMin: 10.00,
        packageMax: 12.00,
        ctc: 12.00,
        location: "Hyderabad / Mumbai",
        jobType: "Full-time",
        driveType: "ON_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 7.0,
        batchYear: 2026,
        positions: 10,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        skillsToAttach: ["Python", "MySQL", "AWS"],
      },
      {
        title: "Global Cognitive & AI Fellow (Off-Campus)",
        companyName: "IBM",
        description: "Global AI residency program working with IBM watsonx AI models and quantum computing simulations.",
        requirements: "B.Tech / M.Tech / PhD candidates. External direct application link provided.",
        salary: 24,
        packageMin: 20.00,
        packageMax: 24.00,
        ctc: 24.00,
        location: "Remote / Bengaluru",
        jobType: "Full-time",
        driveType: "OFF_CAMPUS",
        approvalStatus: "PUBLISHED",
        minCgpa: 7.5,
        batchYear: 2026,
        positions: 4,
        externalUrl: "https://www.ibm.com/careers/research-fellowship",
        skillsToAttach: ["Python", "C++", "AWS"],
      },
    ];

    const createdDrives = [];
    for (const driveData of placementDrives) {
      const { companyName, skillsToAttach, ...driveFields } = driveData;
      const comp = companiesMap[companyName];
      if (!comp) continue;

      const [driveObj] = await Job.findOrCreate({
        where: { title: driveFields.title, companyId: comp.id },
        defaults: {
          ...driveFields,
          companyId: comp.id,
          createdById: recruiter.id,
          approvedById: tpoAdmin.id,
          approvedAt: new Date(),
          status: "active",
        },
      });
      await driveObj.update({
        ...driveFields,
        companyId: comp.id,
        status: "active",
      });
      createdDrives.push(driveObj);

      for (const skName of skillsToAttach) {
        const sk = skillObjs.find((s) => s.name === skName);
        if (sk) {
          try {
            await JobSkill.findOrCreate({
              where: { jobId: driveObj.id, skillId: sk.id },
              defaults: { isPrimary: true },
            });
          } catch (skAttachErr) {
            // Ignored
          }
        }
      }
    }

    // 6. Seed Applications with Multi-Round Pipeline
    // Rahul (student@demo.com) applied to Infosys
    const infosysDrive = createdDrives.find((d) => d.title === "Systems Engineer Trainee");
    if (infosysDrive) {
      const [app1] = await Application.findOrCreate({
        where: { jobId: infosysDrive.id, applicantId: createdStudents[0].id },
        defaults: {
          status: "APPLIED",
          coverLetter: "Strong background in Java and Object-Oriented Design.",
        },
      });

      await ApplicationRound.findOrCreate({
        where: { applicationId: app1.id, roundNumber: 1 },
        defaults: {
          roundName: "Round 1: Online Aptitude & Technical Assessment",
          roundType: "APTITUDE",
          status: "PASSED",
          score: 88.0,
          feedback: "Cleared quantitative and core programming assessment.",
        },
      });

      await ApplicationRound.findOrCreate({
        where: { applicationId: app1.id, roundNumber: 2 },
        defaults: {
          roundName: "Round 2: Technical & HR Interview",
          roundType: "TECHNICAL_INTERVIEW",
          status: "SCHEDULED",
          scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          meetingLink: "https://meet.google.com/inf-campus-round2",
          locationDetails: "Campus Placement Cell Hall B",
        },
      });
    }

    // Priya (priya@demo.com) placed at Microsoft (18 LPA)
    const microsoftDrive = createdDrives.find((d) => d.title === "Frontend Engineering Intern (Azure Tools)");
    if (microsoftDrive) {
      const [app2] = await Application.findOrCreate({
        where: { jobId: microsoftDrive.id, applicantId: createdStudents[1].id },
        defaults: {
          status: "SHORTLISTED",
          coverLetter: "Frontend engineering specialist with React and TypeScript.",
        },
      });

      const [record] = await PlacementRecord.findOrCreate({
        where: { studentId: createdStudents[1].id, driveId: microsoftDrive.id },
        defaults: {
          companyId: companiesMap["Microsoft"].id,
          companyName: "Microsoft",
          offeredPackage: 18.00,
          offerType: "FTE",
          status: "CONFIRMED_PLACED",
          confirmedById: tpoAdmin.id,
          confirmedAt: new Date("2026-02-15"),
        },
      });
      await record.update({
        companyId: companiesMap["Microsoft"].id,
        companyName: "Microsoft",
        offeredPackage: 18.00,
        status: "CONFIRMED_PLACED",
      });
    }

    console.log("Database Seeded Successfully with 10 Distinct Demo Companies!");
    console.log("-----------------------------------------");
    console.log("Demo Accounts (Password: password123):");
    console.log("1. Student (Unplaced):    student@demo.com  (Rahul Sharma | CGPA: 8.75)");
    console.log("2. Student (Placed):      priya@demo.com    (Priya Verma  | Placed at Microsoft 18 LPA)");
    console.log("3. Student (Opted-Out):   amit@demo.com     (Amit Patel   | GATE Aspirant)");
    console.log("4. Recruiter:             recruiter@demo.com (Ananya Roy   | Campus Lead Recruiter)");
    console.log("5. TPO Admin (Officer):   tpo@demo.com      (Dr. R. K. Kapoor | Head TPO)");
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

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("seed.js")) {
  seedData(true);
}
