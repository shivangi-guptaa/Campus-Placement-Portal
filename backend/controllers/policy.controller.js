import { PlacementPolicy } from "../models/index.js";
import { logAuditTrail } from "../utils/auditLogger.js";

/**
 * Get Active Placement Policy
 */
export const getPolicy = async (req, res) => {
  try {
    let policy = await PlacementPolicy.findOne({ where: { isActive: true } });

    if (!policy) {
      policy = await PlacementPolicy.create({
        name: "Default Institutional Placement Policy",
        maxOffersAllowed: 1,
        allowPlacedStudentsToApply: false,
        minCtcIncreasePercentage: 50.0,
        dreamCompanyMinCtc: 10.0,
        isActive: true,
      });
    }

    return res.status(200).json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * TPO_ADMIN: Update Placement Policy
 */
export const updatePolicy = async (req, res) => {
  try {
    const { name, maxOffersAllowed, allowPlacedStudentsToApply, minCtcIncreasePercentage, dreamCompanyMinCtc } = req.body;

    if (req.user.role !== "tpo_admin") {
      return res.status(403).json({ message: "Forbidden - Only TPO Admin can update placement policies", success: false });
    }

    let [policy] = await PlacementPolicy.findOrCreate({
      where: { isActive: true },
      defaults: {
        name: name || "Default Institutional Placement Policy",
        maxOffersAllowed: maxOffersAllowed !== undefined ? parseInt(maxOffersAllowed) : 1,
        allowPlacedStudentsToApply: !!allowPlacedStudentsToApply,
        minCtcIncreasePercentage: minCtcIncreasePercentage !== undefined ? parseFloat(minCtcIncreasePercentage) : 50.0,
        dreamCompanyMinCtc: dreamCompanyMinCtc !== undefined ? parseFloat(dreamCompanyMinCtc) : 10.0,
        isActive: true,
      },
    });

    if (name) policy.name = name;
    if (maxOffersAllowed !== undefined) policy.maxOffersAllowed = parseInt(maxOffersAllowed);
    if (allowPlacedStudentsToApply !== undefined) policy.allowPlacedStudentsToApply = !!allowPlacedStudentsToApply;
    if (minCtcIncreasePercentage !== undefined) policy.minCtcIncreasePercentage = parseFloat(minCtcIncreasePercentage);
    if (dreamCompanyMinCtc !== undefined) policy.dreamCompanyMinCtc = parseFloat(dreamCompanyMinCtc);

    await policy.save();

    await logAuditTrail({
      userId: req.id,
      action: "PLACEMENT_POLICY_UPDATED",
      entity: "PlacementPolicy",
      entityId: policy.id,
      newValue: policy.toJSON(),
      req,
    });

    return res.status(200).json({
      message: "Campus Placement Policy updated successfully!",
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Update Policy Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
