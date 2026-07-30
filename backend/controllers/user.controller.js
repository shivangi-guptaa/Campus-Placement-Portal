import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Skill, UserSkill } from "../models/index.js";
import { uploadFile } from "../utils/upload.js";
import { logAuditTrail } from "../utils/auditLogger.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "supersecretrefreshkey456";

const otpStore = new Map();

export const register = async (req, res) => {
  const { fullName, email, phoneNumber, password, role, degree, branch, cgpa, batchYear, skills } = req.body;
  const file = req.file;

  try {
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "Required fields missing", success: false });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists", success: false });
    }

    let photoUrl = "";
    if (file) {
      const uploadRes = await uploadFile(file, "profiles");
      if (uploadRes) photoUrl = uploadRes.url;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      degree: degree || "MCA",
      branch: branch || "Computer Science",
      cgpa: cgpa ? parseFloat(cgpa) : 8.0,
      batchYear: batchYear ? parseInt(batchYear) : 2026,
      profilePhoto: photoUrl,
    });

    if (skills) {
      const skillNames = String(skills).split(",").map((s) => s.trim()).filter(Boolean);
      for (const sName of skillNames) {
        const [skillObj] = await Skill.findOrCreate({ where: { name: sName } });
        await UserSkill.findOrCreate({
          where: { userId: newUser.id, skillId: skillObj.id },
          defaults: { proficiency: "Intermediate" },
        });
      }
    }

    await logAuditTrail({
      userId: newUser.id,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: newUser.id,
      req,
    });

    res.status(201).json({ message: "Account registered successfully!", success: true });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: `Account does not exist for role '${role}'`, success: false });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

    await logAuditTrail({
      userId: user.id,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
      req,
    });

    return res
      .status(200)
      .cookie("token", accessToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      })
      .json({
        message: `Welcome back, ${user.fullName}!`,
        success: true,
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          degree: user.degree,
          branch: user.branch,
          cgpa: user.cgpa,
          batchYear: user.batchYear,
          profilePhoto: user.profilePhoto,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No registered account found with this email address", success: false });
    }

    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(email, { otp: generatedOtp, expiresAt: Date.now() + 10 * 60 * 1000 });

    console.log(`[OTP GENERATED] Email: ${email} | 6-Digit OTP: ${generatedOtp}`);

    return res.status(200).json({
      message: "6-Digit Verification OTP sent to your registered email address!",
      success: true,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const resetPasswordOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required", success: false });
    }

    const record = otpStore.get(email);
    if (!record || record.otp !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid 6-digit OTP code. Please enter valid OTP.", success: false });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP.", success: false });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User account not found", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(email);

    await logAuditTrail({
      userId: user.id,
      action: "PASSWORD_RESET_OTP",
      entity: "User",
      entityId: user.id,
      req,
    });

    return res.status(200).json({
      message: "Password reset successfully! Please sign in with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Reset Password OTP Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required", success: false });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    await logAuditTrail({
      userId: user.id,
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: user.id,
      req,
    });

    return res.status(200).json({
      message: "Password reset successfully! You can now login with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await logAuditTrail({
        userId: req.user.id,
        action: "USER_LOGOUT",
        entity: "User",
        entityId: req.user.id,
        req,
      });
    }
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const checkUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Skill, as: "skills", through: { attributes: ["proficiency"] } }],
    });
    if (!user) return res.status(404).json({ message: "User not found", success: false });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, skills, cgpa, degree, branch, batchYear, backlogsCount } = req.body;
    const resumeFile = req.files?.file?.[0] || req.files?.resume?.[0];
    const photoFile = req.files?.profilePhoto?.[0];

    const user = await User.findByPk(req.id);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const prevData = { bio: user.bio, cgpa: user.cgpa };

    if (bio !== undefined) user.bio = bio;
    if (cgpa !== undefined) user.cgpa = parseFloat(cgpa);
    if (degree !== undefined) user.degree = degree;
    if (branch !== undefined) user.branch = branch;
    if (batchYear !== undefined) user.batchYear = parseInt(batchYear);
    if (backlogsCount !== undefined) user.backlogsCount = parseInt(backlogsCount);

    if (photoFile) {
      const pRes = await uploadFile(photoFile, "profiles");
      if (pRes) user.profilePhoto = pRes.url;
    }

    if (resumeFile) {
      const rRes = await uploadFile(resumeFile, "resumes");
      if (rRes) {
        user.resume = rRes.url;
        user.resumeOriginalName = rRes.originalName;
      }
    }

    await user.save();

    if (skills) {
      const sNames = String(skills).split(",").map((s) => s.trim()).filter(Boolean);
      await UserSkill.destroy({ where: { userId: user.id } });
      for (const sName of sNames) {
        const [skObj] = await Skill.findOrCreate({ where: { name: sName } });
        await UserSkill.create({ userId: user.id, skillId: skObj.id, proficiency: "Intermediate" });
      }
    }

    await logAuditTrail({
      userId: user.id,
      action: "PROFILE_UPDATED",
      entity: "User",
      entityId: user.id,
      previousValue: prevData,
      newValue: { bio: user.bio, cgpa: user.cgpa },
      req,
    });

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Skill, as: "skills", through: { attributes: ["proficiency"] } }],
    });

    return res.status(200).json({
      message: "Profile updated successfully!",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
