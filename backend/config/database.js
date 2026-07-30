import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DB_NAME = process.env.DB_NAME || "placement_portal";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = parseInt(process.env.DB_PORT || "3306");

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: { decimalNumbers: true },
});

export const connectDB = async () => {
  try {
    // 1. Auto-create database if it doesn't exist
    try {
      const connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await connection.end();
      console.log(`[MySQL] Database '${DB_NAME}' verified/created.`);
    } catch (err) {
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.warn("\n==========================================================");
        console.warn(`[MySQL Auth] Please verify DB_PASSWORD in .env`);
        console.warn("==========================================================\n");
      } else {
        console.warn("[MySQL Init Note]:", err.message);
      }
    }

    await sequelize.authenticate();
    console.log("[MySQL] Connection established via Sequelize.");
    
    // Sync models & composite indexes
    await sequelize.sync({ alter: false });
    console.log("[MySQL] 13 Relational Tables & Indexes synchronized successfully.");
  } catch (error) {
    if (error.name === 'SequelizeAccessDeniedError' || error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("[MySQL Connection Error]: Access Denied. Verify DB_PASSWORD in .env.");
    } else {
      console.error("[MySQL Connection Error]:", error.message);
    }
  }
};

export default sequelize;
