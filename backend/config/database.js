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

const isRender = !!(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const isLocalhostHost = !DB_HOST || DB_HOST === "127.0.0.1" || DB_HOST === "localhost" || DB_HOST.includes("Your-MySQL-Host");

// On Render, if DB_HOST is localhost/127.0.0.1/placeholder, fall back to SQLite to prevent ECONNREFUSED 127.0.0.1:3306
const useMysql = !!(DB_HOST && DB_USER && DB_PASS && !(isRender && isLocalhostHost));

let sequelize;

if (useMysql) {
  console.log(`[DB] Remote MySQL credentials detected (${DB_HOST}:${DB_PORT}) — initializing MySQL connection.`);
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: { decimalNumbers: true },
  });
} else {
  console.log("[DB] Using SQLite embedded database (Render / local fallback).");
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
    console.log(`[DB] Connection authenticated successfully (${useMysql ? "MySQL" : "SQLite"}).`);
    await sequelize.sync({ alter: true });
    console.log("[DB] Database models & tables synchronized successfully.");
  } catch (error) {
    console.error("[DB Connection Error]:", error.message);
  }
};

export default sequelize;
