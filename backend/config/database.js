import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || "placement_portal";
const DB_PORT = parseInt(process.env.DB_PORT || "3306");

// Use MySQL if credentials are fully configured, else fall back to SQLite
const useMysql = !!(DB_HOST && DB_USER && DB_PASS);

let sequelize;

if (useMysql) {
  console.log("[DB] MySQL credentials detected — using MySQL.");
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: { decimalNumbers: true },
  });
} else {
  console.log("[DB] No MySQL credentials found — using SQLite fallback.");
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(process.cwd(), "placement_portal.sqlite"),
    logging: false,
  });
}

export { sequelize };

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] Connection established (${useMysql ? "MySQL" : "SQLite"}).`);
    await sequelize.sync({ alter: true });
    console.log("[DB] Tables synchronized successfully.");
  } catch (error) {
    console.error("[DB Connection Error]:", error.message);
  }
};

export default sequelize;
