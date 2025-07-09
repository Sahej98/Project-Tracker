const Task = require("../models/task.model");
const Project = require("../models/project.model"); // Required to update project status

const createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

// GET /tasks
const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    let filter = {};
    if (projectId) {
      filter.projectId = projectId; // Make sure this matches your task schema field
    }

    const tasks = await Task.find(filter);
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

// PATCH /tasks/:taskId/toggle-subtask
const toggleSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { subtaskIndex } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      subtaskIndex === undefined ||
      subtaskIndex < 0 ||
      subtaskIndex >= task.subtasks.length
    ) {
      return res.status(400).json({ message: "Invalid subtask index" });
    }

    // ✅ Toggle subtask
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

    // ✅ Update task status
    const allDone = task.subtasks.every((s) => s.completed);
    const anyDone = task.subtasks.some((s) => s.completed);

    task.status = allDone ? "completed" : anyDone ? "in progress" : "pending";
    await task.save();

    // ✅ Now use task.projectId instead of task.project
    const project = await Project.findById(task.projectId);
    if (project) {
      const allTasks = await Task.find({ projectId: project._id });

      const allTasksComplete = allTasks.every((t) => t.status === "completed");
      const allTasksPending = allTasks.every((t) => t.status === "pending");

      if (allTasksComplete) {
        project.status = "completed";
      } else if (allTasksPending) {
        project.status = "pending";
      } else {
        project.status = "in progress";
      }

      await project.save();
    }

    res.json(task);
  } catch (err) {
    console.error("Server error in toggleSubtask:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleSubtask,
};
