/**
 * Migration 2: Standardize CTC columns to DECIMAL(10,2) and update Application.status ENUM
 */
export const up = async ({ context: sequelize }) => {
  const isMysql = sequelize.getDialect() === "mysql";
  console.log(`[Migration 02] Standardizing CTC to DECIMAL(10,2) and cleaning ENUMs on ${sequelize.getDialect()}...`);

  if (isMysql) {
    try {
      // 1. Clean existing application rows to uppercase valid ENUM values
      await sequelize.query("UPDATE applications SET status = 'APPLIED' WHERE status IN ('applied', 'pending', 'reviewing', 'eligible')");
      await sequelize.query("UPDATE applications SET status = 'SHORTLISTED' WHERE status IN ('shortlisted', 'interview_scheduled')");
      await sequelize.query("UPDATE applications SET status = 'REJECTED' WHERE status IN ('rejected')");
      await sequelize.query("UPDATE applications SET status = 'WITHDRAWN' WHERE status IN ('withdrawn')");
      await sequelize.query("UPDATE applications SET status = 'SHORTLISTED' WHERE status NOT IN ('APPLIED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN')");

      // 2. Safely alter columns
      await sequelize.query("ALTER TABLE users MODIFY COLUMN currentPackage DECIMAL(10,2) DEFAULT 0.00");
      await sequelize.query("ALTER TABLE jobs MODIFY COLUMN packageMin DECIMAL(10,2) NULL");
      await sequelize.query("ALTER TABLE jobs MODIFY COLUMN packageMax DECIMAL(10,2) NULL");
      await sequelize.query("ALTER TABLE jobs MODIFY COLUMN ctc DECIMAL(10,2) NULL");
      await sequelize.query("ALTER TABLE placementrecords MODIFY COLUMN offeredPackage DECIMAL(10,2) NOT NULL");
      await sequelize.query("ALTER TABLE applications MODIFY COLUMN status ENUM('APPLIED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN') DEFAULT 'APPLIED'");
      console.log("[Migration 02] Successfully altered MySQL columns to DECIMAL(10,2) & standardized ENUMs.");
    } catch (err) {
      console.error("[Migration 02 Error]:", err.message);
      throw err;
    }
  }
};

export const down = async ({ context: sequelize }) => {
  console.log("[Migration 02 Down] Rollback decimal and enum standardization...");
};
