/**
 * Migration 1: Initialize Core Placement System Tables
 */
export const up = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  console.log("[Migration 01] Initializing Core Schema Tables & Indexes...");

  // Ensures tables exist using safe sync
  await sequelize.sync();
};

export const down = async ({ context: sequelize }) => {
  console.log("[Migration 01 Down] Rollback initial schema...");
};
