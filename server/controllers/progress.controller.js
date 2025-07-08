// controllers/progress.controller.js
const Progress = require("../models/progress.model");

const submitProgress = async (req, res) => {
  const { projectId, percentDone, notes } = req.body;
  const employeeId = req.user.userId;

  try {
    const progress = await Progress.findOneAndUpdate(
      { projectId, employeeId, date: new Date().setHours(0, 0, 0, 0) },
      { percentDone, notes },
      { upsert: true, new: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(400).json({ error: "Failed to submit progress" });
  }
};

const getProjectProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ projectId: req.params.projectId }).populate("employeeId", "username fullname");
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

module.exports = { submitProgress, getProjectProgress };
