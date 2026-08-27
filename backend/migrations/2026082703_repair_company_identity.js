import { repairCompanyIdentity } from "../repair_company_identity.js";

/**
 * Migration 3: Repair & Synchronize Company Identity Across Tables
 */
export const up = async ({ context: sequelize }) => {
  console.log("[Migration 03] Executing Company Identity Repair & Data Synchronization...");
  await repairCompanyIdentity();
};

export const down = async ({ context: sequelize }) => {
  console.log("[Migration 03 Down] Rollback company identity repair...");
};
