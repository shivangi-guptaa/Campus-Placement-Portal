import { sequelize } from "./config/database.js";
import * as m1 from "./migrations/2026082701_initial_schema.js";
import * as m2 from "./migrations/2026082702_standardize_decimals_and_enums.js";
import * as m3 from "./migrations/2026082703_repair_company_identity.js";

const migrations = [
  { name: "2026082701_initial_schema", migration: m1 },
  { name: "2026082702_standardize_decimals_and_enums", migration: m2 },
  { name: "2026082703_repair_company_identity", migration: m3 },
];

export const runMigrations = async () => {
  console.log("==========================================");
  console.log("📦 RUNNING SEQUELIZE DATABASE MIGRATIONS");
  console.log("==========================================");

  try {
    await sequelize.authenticate();

    // Create SequelizeMeta table to track applied migrations
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS SequelizeMeta (
        name VARCHAR(255) NOT NULL PRIMARY KEY,
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [appliedRows] = await sequelize.query("SELECT name FROM SequelizeMeta");
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    for (const { name, migration } of migrations) {
      if (!appliedSet.has(name)) {
        console.log(`⏳ Applying migration: ${name}...`);
        await migration.up({ context: sequelize });
        await sequelize.query("INSERT INTO SequelizeMeta (name) VALUES (?)", {
          replacements: [name],
        });
        console.log(`✅ Applied migration: ${name}`);
      } else {
        console.log(`ℹ️ Migration already applied: ${name}`);
      }
    }

    console.log("==========================================");
    console.log("🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Migration Error:", error);
    throw error;
  }
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("migrator.js")) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
