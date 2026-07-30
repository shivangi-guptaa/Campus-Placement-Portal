import { AuditLog } from "../models/index.js";

export const logAuditTrail = async ({
  userId,
  action,
  entity,
  entityId,
  previousValue = null,
  newValue = null,
  req = null,
}) => {
  try {
    const ipAddress = req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1") : "127.0.0.1";
    const userAgent = req ? req.headers["user-agent"] : "System";

    await AuditLog.create({
      userId: userId || null,
      action,
      entity: entity || "System",
      entityId: entityId || null,
      previousValue: previousValue ? JSON.parse(JSON.stringify(previousValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
    });
  } catch (error) {
    console.error("Error creating audit log:", error.message);
  }
};
