const DailyTask = require("../models/dailyTask.model");
const Task = require("../models/task.model");
const Project = require("../models/project.model");

// controllers/dailyTask.controller.js
exports.getClaimedSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    const reports = await DailyTask.find({
      date: today,
      "tasks.taskId": taskId,
    }).lean();

    const claimedSubtaskIndexes = new Set();

    reports.forEach((report) => {
      report.tasks.forEach((t) => {
        if (t.taskId.toString() === taskId) {
          claimedSubtaskIndexes.add(t.subtaskIndex);
        }
      });
    });

    res.json({ claimed: Array.from(claimedSubtaskIndexes) });
  } catch (err) {
    console.error("getClaimedSubtasks error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createOrUpdateDailyTasks = async (req, res) => {
  try {
    const { subtasks, projectId, projectTitle } = req.body;

    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in request" });
    }

    if (!userId || !Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    console.log("🔍 Incoming subtasks:", subtasks);

    const taskIds = [...new Set(subtasks.map((s) => s.taskId))];

    const tasks = await Task.find({ _id: { $in: taskIds } })
      .populate("projectId", "title")
      .lean();

    let resolvedProjectTitle = projectTitle;
    if (!resolvedProjectTitle && projectId) {
      const project = await Project.findById(projectId).lean();
      resolvedProjectTitle = project?.title || "Unknown Project";
    }

    const enrichedTasks = subtasks.map(({ taskId, subtaskIndex }) => {
      const task = tasks.find((t) => t._id.toString() === taskId);
      const subtask = task?.subtasks?.[subtaskIndex];

      return {
        taskId,
        subtaskIndex,
        taskTitle: task?.title || "Unknown Task",
        subtaskTitle: subtask?.title || "Unknown Subtask",
        projectTitle:
          task?.projectId?.title ||
          task?.projectTitle ||
          resolvedProjectTitle ||
          "Unknown Project",
        status: "pending",
        remarks: "",
      };
    });

    const today = new Date().toISOString().slice(0, 10);

    // 🔒 Check if subtasks are already claimed by other employees
    const otherReports = await DailyTask.find({
      userId: { $ne: userId },
      date: today,
      "tasks.taskId": { $in: taskIds },
    }).lean();

    const globallyClaimed = new Set();
    otherReports.forEach((report) => {
      report.tasks.forEach((t) => {
        globallyClaimed.add(`${t.taskId}-${t.subtaskIndex}`);
      });
    });

    const unclaimedSubtasks = enrichedTasks.filter(
      (t) => !globallyClaimed.has(`${t.taskId}-${t.subtaskIndex}`)
    );

    if (unclaimedSubtasks.length === 0) {
      console.log(
        "⚠️ All selected subtasks are already claimed by other employees."
      );
      return res.status(400).json({
        error: "All selected subtasks are already claimed by other employees.",
      });
    }

    // ✅ Proceed to save only unclaimed subtasks

    const existingReport = await DailyTask.findOne({ userId, date: today });

    if (existingReport) {
      const existingKeys = new Set(
        existingReport.tasks.map((t) => `${t.taskId}-${t.subtaskIndex}`)
      );

      const newUniqueTasks = unclaimedSubtasks.filter(
        (t) => !existingKeys.has(`${t.taskId}-${t.subtaskIndex}`)
      );

      if (newUniqueTasks.length === 0) {
        console.log(
          "⚠️ No new unique subtasks to add (already exist in your report)."
        );
        return res.json(existingReport);
      }

      existingReport.tasks.push(...newUniqueTasks);
      await existingReport.save();

      console.log("✅ Appended new tasks to existing daily report.");
      return res.json(existingReport);
    }

    // No report exists - create a new one
    const newReport = await DailyTask.create({
      userId,
      date: today,
      tasks: unclaimedSubtasks,
    });

    console.log("✅ New daily task report created with unclaimed subtasks.");
    res.json(newReport);
  } catch (err) {
    console.error("❗ Error in createOrUpdateDailyTasks:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get All Users' Reports Grouped
exports.getAllTodayReports = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const reports = await DailyTask.find({ date: today }).populate(
      "userId",
      "fullname"
    );

    // Get all unique taskIds from reports
    const taskIds = reports.flatMap((r) => r.tasks.map((t) => t.taskId));
    const uniqueTaskIds = [...new Set(taskIds.map((id) => id.toString()))];

    // Fetch tasks with project titles
    const tasks = await Task.find({ _id: { $in: uniqueTaskIds } })
      .populate("projectId", "title")
      .lean();

    const taskMap = {};
    tasks.forEach((t) => {
      taskMap[t._id.toString()] = {
        taskTitle: t.title,
        projectTitle: t.projectId?.title || "Unknown Project",
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
    const taskIds = report.tasks.map((t) => t.taskId.toString());

    // Fetch related tasks with project titles
    const tasks = await Task.find({ _id: { $in: taskIds } })
      .populate("projectId", "title")
      .lean();

    const taskMap = {};
    tasks.forEach((t) => {
      taskMap[t._id.toString()] = {
        taskTitle: t.title,
        projectTitle: t.projectId?.title || "Unknown Project",
        projectId: t.projectId?._id?.toString() || null, // ✅ Include projectId
      };
    });

    // Enrich tasks with projectId
    const enrichedTasks = report.tasks.map((t) => {
      const taskInfo = taskMap[t.taskId.toString()] || {};
      return {
        taskId: t.taskId,
        subtaskIndex: t.subtaskIndex,
        taskTitle: taskInfo.taskTitle || t.taskTitle || "Unknown Task",
        subtaskTitle: t.subtaskTitle || "Unknown Subtask",
        projectTitle: taskInfo.projectTitle || "Unknown Project",
        projectId: taskInfo.projectId, // ✅ Add projectId here
        status: t.status,
        remarks: t.remarks || "",
        timeSpent: t.timeSpent || "-", // ✅ Safe fallback for timeSpent
      };
    });

    // ✅ Final Response including report _id
    res.json({
      _id: report._id, // ✅ Important fix
      userId: report.userId,
      date: report.date,
      tasks: enrichedTasks,
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

    console.log("Incoming update:", tasks);

    const report = await DailyTask.findById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Update subtasks in the report
    tasks.forEach((u) => {
      const orig = report.tasks.find(
        (t) =>
          t.taskId.toString() === u.taskId && t.subtaskIndex === u.subtaskIndex
      );

      if (orig) {
        orig.status = u.status || orig.status;
        orig.remarks = u.remarks !== undefined ? u.remarks : orig.remarks;
        orig.timeSpent =
          u.timeSpent !== undefined ? u.timeSpent : orig.timeSpent;

        console.log("✅ Updated Task:", {
          taskId: orig.taskId,
          subtaskIndex: orig.subtaskIndex,
          status: orig.status,
          remarks: orig.remarks,
          timeSpent: orig.timeSpent,
        });
      }
    });

    report.markModified("tasks");
    await report.save();

    console.log("✅ Daily report updated successfully");

    // 🔥 Cascade Status Updates: Task & Project
    const updatedTaskIds = [...new Set(tasks.map((t) => t.taskId))];
    const today = new Date().toISOString().slice(0, 10);

    for (const taskId of updatedTaskIds) {
      const task = await Task.findById(taskId);
      if (!task) continue;

      const reportsWithTask = await DailyTask.find({
        "tasks.taskId": taskId,
        date: today,
      });

      const subtaskCount = task.subtasks.length;

      let subtaskStatuses = Array(subtaskCount).fill("pending");

      for (let i = 0; i < subtaskCount; i++) {
        for (const report of reportsWithTask) {
          const t = report.tasks.find(
            (x) => x.taskId.toString() === taskId && x.subtaskIndex === i
          );
          if (t) {
            if (t.status === "completed") {
              subtaskStatuses[i] = "completed";
            } else if (
              t.status === "in progress" &&
              subtaskStatuses[i] !== "completed"
            ) {
              subtaskStatuses[i] = "in progress";
            }
          }
        }
      }

      // Determine Task Status
      if (subtaskStatuses.every((s) => s === "completed")) {
        task.status = "completed";
      } else if (subtaskStatuses.every((s) => s === "pending")) {
        task.status = "pending";
      } else {
        task.status = "in progress";
      }

      await task.save();

      // Handle Project Status
      if (task.projectId) {
        const projectTasks = await Task.find({ projectId: task.projectId });
        const project = await Project.findById(task.projectId);

        const taskStatuses = projectTasks.map((t) => t.status);

        if (taskStatuses.every((s) => s === "completed")) {
          project.status = "completed";

          if (!project.completedAt) {
            project.completedAt = new Date(); // ✅ Set completedAt when project is done
          }
        } else {
          project.status = taskStatuses.every((s) => s === "pending")
            ? "pending"
            : "in progress";

          project.completedAt = null; // ✅ Clear completedAt if project is reopened
        }

        await project.save();
      }
    }

    res.json({ message: "Report and statuses updated successfully" });
  } catch (err) {
    console.error("submitDailyReport error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const reports = await DailyTask.find({ date }).populate(
      "userId",
      "fullname"
    );

    const taskIds = reports.flatMap((r) => r.tasks.map((t) => t.taskId));
    const uniqueTaskIds = [...new Set(taskIds.map((id) => id.toString()))];

    const tasks = await Task.find({ _id: { $in: uniqueTaskIds } })
      .populate("projectId", "title")
      .lean();

    const taskMap = {};
    tasks.forEach((t) => {
      taskMap[t._id.toString()] = {
        taskTitle: t.title,
        projectTitle: t.projectId?.title || "Unknown Project",
      };
    });

    const grouped = {};

    reports.forEach((report) => {
      const employee = report.userId.fullname;
      if (!grouped[employee]) grouped[employee] = {};

      report.tasks.forEach((t) => {
        const taskInfo = taskMap[t.taskId.toString()] || {};
        const project = taskInfo.projectTitle || "Unknown Project";
        const taskTitle = taskInfo.taskTitle || "Unknown Task";

        if (!grouped[employee][project]) grouped[employee][project] = {};
        if (!grouped[employee][project][taskTitle])
          grouped[employee][project][taskTitle] = [];

        grouped[employee][project][taskTitle].push({
          subtaskTitle: t.subtaskTitle,
          status: t.status,
          remarks: t.remarks || "None",
          timeSpent: t.timeSpent || "-", // ✅ Added timeSpent
        });
      });
    });

    res.json({ grouped });
  } catch (err) {
    console.error("Admin Report Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
