const User = require("../models/user.model");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const DailyTask = require("../models/dailyTask.model");

exports.getDashboardStats = async (req, res) => {
  try {
    const [managers, employees, clients, allProjects, allTasks] = await Promise.all([
      User.countDocuments({ role: "manager" }),
      User.countDocuments({ role: "employee" }),
      User.countDocuments({ role: "client" }),
      Project.find(),
      Task.find()
    ]);

    const projectStats = {
      total: allProjects.length,
      pending: allProjects.filter(p => p.status === "pending").length,
      inProgress: allProjects.filter(p => p.status === "in progress").length,
      completed: allProjects.filter(p => p.status === "completed").length,
      blocked: allProjects.filter(p => p.status === "blocked").length || 0
    };

    const taskStats = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === "completed").length
    };

    res.json({
      managers,
      employees,
      clients,
      projects: projectStats,
      tasks: taskStats
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getTimeStats = async (req, res) => {
  try {
    const reports = await DailyTask.find({}).lean();

    const dailySums = {};

    reports.forEach((report) => {
      const date = report.date;
      if (!dailySums[date]) dailySums[date] = 0; // Minutes

      report.tasks.forEach((task) => {
        const time = parseTime(task.timeSpent);
        dailySums[date] += time; // time in minutes
      });
    });

    // Convert to desired format
    const result = Object.entries(dailySums).map(([date, minutes]) => ({
      date,
      totalHours: Math.floor(minutes / 60),
      totalMinutes: minutes % 60,
    }));

    res.json(result);
  } catch (err) {
    console.error("getTimeStats error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Helper to parse "2 hr 5 min" into minutes
function parseTime(str) {
  if (!str) return 0;

  const hrMatch = str.match(/(\d+)\s*h/);
  const minMatch = str.match(/(\d+)\s*m/);

  const hours = hrMatch ? parseInt(hrMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;

  return hours * 60 + minutes;
}

exports.getTasksPerWeek = async (req, res) => {
  try {
    const tasksPerWeek = await DailyTask.aggregate([
      { $unwind: "$tasks" },
      { $match: { "tasks.status": "completed" } },
      {
        $group: {
          _id: { $isoWeek: { $toDate: "$date" } },
          completedTasks: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const formattedData = tasksPerWeek.map(item => ({
      week: `W${item._id.toString().padStart(2, "0")}`,
      completedTasks: item.completedTasks
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("getTasksPerWeek error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getProjectsPerWeek = async (req, res) => {
  try {
    const projects = await Project.find({
      status: "completed",
      completedAt: { $ne: null },
    }).lean();

    const weeklyCounts = {};

    projects.forEach((project) => {
      if (!project.completedAt) return; // Skip if completedAt is missing

      const date = new Date(project.completedAt);
      const week = getISOWeek(date);

      if (!weeklyCounts[week]) weeklyCounts[week] = 0;
      weeklyCounts[week]++;
    });

    const result = Object.entries(weeklyCounts).map(([week, count]) => ({
      week: `W${week.toString().padStart(2, "0")}`,
      completedProjects: count,
    }));

    res.json(result);
  } catch (err) {
    console.error("getProjectsPerWeek error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Helper to get ISO week number
function getISOWeek(date) {
  const tmpDate = new Date(date);
  tmpDate.setHours(0, 0, 0, 0);
  tmpDate.setDate(tmpDate.getDate() + 3 - ((tmpDate.getDay() + 6) % 7));
  const firstThursday = new Date(tmpDate.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  const weekNumber = 1 + Math.round(((tmpDate - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return weekNumber;
}