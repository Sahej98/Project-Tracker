const DailyTask = require("../models/dailyTask.model");
const Task = require("../models/task.model");

// Create/update today's daily tasks with titles
exports.createOrUpdateDailyTasks = async (req, res) => {
  try {
    const { userId, subtasks } = req.body;
    if (!userId || !Array.isArray(subtasks)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const taskIds = [...new Set(subtasks.map((s) => s.taskId))];
    const tasks = await Task.find({ _id: { $in: taskIds } });

    const enriched = subtasks.map(({ taskId, subtaskIndex }) => {
      const task = tasks.find((t) => t._id.toString() === taskId);
      const subtask = task?.subtasks?.[subtaskIndex];
      return {
        taskId,
        subtaskIndex,
        taskTitle: task?.title || "Unknown Task",
        subtaskTitle: subtask?.title || "Unknown Subtask",
        status: "pending",
        remarks: "",
      };
    });

    const today = new Date().toISOString().slice(0, 10);
    const report = await DailyTask.findOneAndUpdate(
      { userId, date: today },
      { userId, date: today, tasks: enriched },
      { new: true, upsert: true }
    );
    res.json(report);
  } catch (err) {
    console.error("createOrUpdateDailyTasks error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get today’s report
exports.getTodayReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const report = await DailyTask.findOne({ userId, date: today });
    res.json(report || { userId, date: today, tasks: [] });
  } catch (err) {
    console.error("getTodayReport error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Submit updates to report
exports.submitDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks } = req.body;
    const report = await DailyTask.findById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    tasks.forEach((u) => {
      const orig = report.tasks.find((t) => t.taskId.toString() === u.taskId && t.subtaskIndex === u.subtaskIndex);
      if (orig) {
        orig.status = u.status;
        orig.remarks = u.remarks;
      }
    });

    await report.save();
    res.json(report);
  } catch (err) {
    console.error("submitDailyReport error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
