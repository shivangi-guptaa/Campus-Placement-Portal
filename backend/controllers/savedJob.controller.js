import { SavedJob, Job, Company } from "../models/index.js";

export const toggleSaveJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    const existing = await SavedJob.findOne({ where: { userId, jobId } });
    if (existing) {
      await existing.destroy();
      return res.status(200).json({ message: "Drive removed from saved list", success: true, saved: false });
    }

    await SavedJob.create({ userId, jobId });
    return res.status(201).json({ message: "Drive saved to your bookmarks!", success: true, saved: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const saved = await SavedJob.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",
          include: [{ model: Company, as: "company" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, savedJobs: saved });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
