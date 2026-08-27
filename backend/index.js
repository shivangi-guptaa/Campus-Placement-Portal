import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";

import { connectDB } from "./config/database.js";
import { swaggerSpec } from "./config/swagger.js";
import { logger } from "./config/logger.js";

import userRouter from "./routes/user.route.js";
import companyRouter from "./routes/company.route.js";
import jobRouter from "./routes/job.route.js";
import applicationRouter from "./routes/application.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import recommendationRouter from "./routes/recommendation.route.js";
import interviewRouter from "./routes/interview.route.js";
import savedJobRouter from "./routes/savedJob.route.js";
import notificationRouter from "./routes/notification.route.js";

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Dynamic CORS Configuration allowing local & Vercel production deployment origins
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Return exact requesting origin string to support credentials: true
    return callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};
app.use(cors(corsOptions));

// HTTP Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Swagger API Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static File Uploads
app.use("/uploads", express.static(path.join(__dirname, "backend", "public", "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// REST API Endpoints
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/application", applicationRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recommendation", recommendationRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/saved-job", savedJobRouter);
app.use("/api/notification", notificationRouter);

// Serve Frontend Production Build if exists
app.use(express.static(path.join(__dirname, "frontend/dist")));
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/api-docs")) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"), (err) => {
    if (err) {
      res.status(200).send("<h1>University Campus Placement & Internship Management API</h1><p>API documentation available at <a href='/api-docs'>/api-docs</a></p>");
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    success: false,
  });
});

app.listen(PORT, async () => {
  console.log(`======================================================`);
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Swagger API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`======================================================`);
  await connectDB();
});
