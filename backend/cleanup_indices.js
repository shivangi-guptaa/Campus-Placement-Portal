import { sequelize } from "./config/database.js";

const cleanup = async () => {
  try {
    await sequelize.authenticate();
    const [indices] = await sequelize.query(
      "SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'skills' AND INDEX_NAME != 'PRIMARY'"
    );

    console.log(`Found ${indices.length} indices on skills table.`);
    for (const idx of indices) {
      try {
        await sequelize.query(`ALTER TABLE skills DROP INDEX \`${idx.INDEX_NAME}\``);
        console.log(`Dropped index: ${idx.INDEX_NAME}`);
      } catch (err) {
        console.log(`Could not drop ${idx.INDEX_NAME}:`, err.message);
      }
    }

    await sequelize.query("ALTER TABLE skills ADD UNIQUE INDEX idx_skills_name (name)");
    console.log("Clean unique index 'idx_skills_name' added.");

    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
};

cleanup();
