const DailyTask = require("../models/dailyTask.model");
const Task = require("../models/task.model");
const Project = require("../models/project.model");

// Create or Update Daily Tasks
exports.createOrUpdateDailyTasks = async (req, res) => {
  try {
    const { userId, subtasks, projectId, projectTitle } = req.body;

    if (!userId || !Array.isArray(subtasks)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    console.log("🔍 Incoming subtasks:", subtasks);

    // Get unique taskIds
    const taskIds = [...new Set(subtasks.map((s) => s.taskId))];

    const tasks = await Task.find({ _id: { $in: taskIds } })
      .populate("projectId", "title")
      .lean();

    console.log("📦 Fetched tasks from DB (with projectId populated):");
    tasks.forEach((t) => {
      console.log({
        taskId: t._id.toString(),
        taskTitle: t.title,
        projectId: t.projectId, // Should show {_id, title} if populated correctly
      });
    });

    // Resolve project title
    let resolvedProjectTitle = projectTitle;

    if (!resolvedProjectTitle && projectId) {
      const proj = await Project.findById(projectId).lean();
      resolvedProjectTitle = proj?.title || "Unknown Project";
    }

    // Enrich subtasks
    const enriched = subtasks.map(({ taskId, subtaskIndex }) => {
      const task = tasks.find((t) => t._id.toString() === taskId);
      const subtask = task?.subtasks?.[subtaskIndex];

      const finalProjectTitle =
        task?.projectId?.title ||
        task?.projectTitle ||
        resolvedProjectTitle ||
        "Unknown Project";

      return {
        taskId,
        subtaskIndex,
        taskTitle: task?.title || "Unknown Task",
        subtaskTitle: subtask?.title || "Unknown Subtask",
        projectTitle: finalProjectTitle,
        status: "pending",
        remarks: "",
      };
    });

    console.log("📝 Enriched subtasks for daily task:", enriched);

    // Save daily task report
    const today = new Date().toISOString().slice(0, 10);

    const report = await DailyTask.findOneAndUpdate(
      { userId, date: today },
      { userId, date: today, tasks: enriched },
      { new: true, upsert: true }
    );

    console.log("✅ Daily task report saved/updated");

    res.json(report);
  } catch (err) {
    console.error("❗ Error in createOrUpdateDailyTasks:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get All Users' Reports Grouped
exports.getAllTodayReports = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const reports = await DailyTask.find({ date: today })
      .populate("userId", "fullname");

    // Get all unique taskIds from reports
    const taskIds = reports.flatMap(r => r.tasks.map(t => t.taskId));
    const uniqueTaskIds = [...new Set(taskIds.map(id => id.toString()))];

    // Fetch tasks with project titles
    const tasks = await Task.find({ _id: { $in: uniqueTaskIds } })
      .populate("projectId", "title")
      .lean();

    const taskMap = {};
    tasks.forEach(t => {
      taskMap[t._id.toString()] = {
        taskTitle: t.title,
        projectTitle: t.projectId?.title || "Unknown Project"
      };
    });

    const grouped = {};

    reports.forEach((report) => {
      const employeeName = report.userId.fullname;
      if (!grouped[employeeName]) grouped[employeeName] = {};

      report.tasks.forEach((task) => {
        const taskInfo = taskMap[task.taskId.toString()] || {};
        const projectName = taskInfo.projectTitle || "Unknown Project";
        const taskTitle = taskInfo.taskTitle || "Unknown Task";
        const subtaskTitle = task.subtaskTitle || "Unknown Subtask";

        if (!grouped[employeeName][projectName]) {
          grouped[employeeName][projectName] = {};
        }

        if (!grouped[employeeName][projectName][taskTitle]) {
          grouped[employeeName][projectName][taskTitle] = [];
        }

        grouped[employeeName][projectName][taskTitle].push({
          subtaskTitle,
          status: task.status,
          remarks: task.remarks || "None",
        });
      });
    });

    res.json({ grouped });
  } catch (err) {
    console.error("getAllTodayReports error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get Today's Report for a Specific User
exports.getTodayReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    const report = await DailyTask.findOne({ userId, date: today }).lean();

    if (!report) {
      return res.json({ userId, date: today, tasks: [] });
    }

    // Get unique taskIds from this user's report
    const taskIds = report.tasks.map(t => t.taskId.toString());

    // Fetch related tasks with project titles
    const tasks = await Task.find({ _id: { $in: taskIds } })
      .populate("projectId", "title")
      .lean();

    const taskMap = {};
    tasks.forEach(t => {
      taskMap[t._id.toString()] = {
        taskTitle: t.title,
        projectTitle: t.projectId?.title || "Unknown Project"
      };
    });

    // Enrich tasks with project titles dynamically
    const enrichedTasks = report.tasks.map(t => {
      const taskInfo = taskMap[t.taskId.toString()] || {};
      return {
        taskId: t.taskId,
        subtaskIndex: t.subtaskIndex,
        taskTitle: taskInfo.taskTitle || t.taskTitle || "Unknown Task",
        subtaskTitle: t.subtaskTitle || "Unknown Subtask",
        projectTitle: taskInfo.projectTitle || "Unknown Project",
        status: t.status,
        remarks: t.remarks || ""
      };
    });

    res.json({
      userId: report.userId,
      date: report.date,
      tasks: enrichedTasks
    });

  } catch (err) {
    console.error("getTodayReport error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Submit Daily Report Updates
exports.submitDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks } = req.body;

    const report = await DailyTask.findById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    tasks.forEach((u) => {
      const orig = report.tasks.find(
        (t) =>
          t.taskId.toString() === u.taskId && t.subtaskIndex === u.subtaskIndex
      );
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

exports.getAllReports = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const reports = await DailyTask.find({ date }).populate('userId', 'fullname');

    const taskIds = reports.flatMap(r => r.tasks.map(t => t.taskId));
    const uniqueTaskIds = [...new Set(taskIds.map(id => id.toString()))];

    const tasks = await Task.find({ _id: { $in: uniqueTaskIds } })
      .populate('projectId', 'title')
      .lean();

    const taskMap = {};
    tasks.forEach(t => {
      taskMap[t._id.toString()] = {
        taskTitle: t.title,
        projectTitle: t.projectId?.title || 'Unknown Project'
      };
    });

    const grouped = {};

    reports.forEach(report => {
      const employee = report.userId.fullname;
      if (!grouped[employee]) grouped[employee] = {};

      report.tasks.forEach(t => {
        const taskInfo = taskMap[t.taskId.toString()] || {};
        const project = taskInfo.projectTitle || 'Unknown Project';
        const taskTitle = taskInfo.taskTitle || 'Unknown Task';

        if (!grouped[employee][project]) grouped[employee][project] = {};
        if (!grouped[employee][project][taskTitle]) grouped[employee][project][taskTitle] = [];

        grouped[employee][project][taskTitle].push({
          subtaskTitle: t.subtaskTitle,
          status: t.status,
          remarks: t.remarks || 'None'
        });
      });
    });

    res.json({ grouped });

  } catch (err) {
    console.error('Admin Report Fetch Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}