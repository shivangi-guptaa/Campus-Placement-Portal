import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Access Token Required", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey123");
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token", success: false });
    }

    req.id = decoded.userId;
    req.user = await User.findByPk(decoded.userId, { attributes: { exclude: ["password"] } });
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token Expired or Invalid", success: false });
  }
};

export const recruiterOrAdminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "recruiter" || req.user.role === "tpo_admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Recruiter or TPO Admin only", success: false });
  }
};

export const tpoAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "tpo_admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: TPO Admin only", success: false });
  }
};
