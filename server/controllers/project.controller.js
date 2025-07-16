const Project = require("../models/project.model");
const Task = require("../models/task.model");

// Get projects based on role
const getProjects = async (req, res) => {
  try {
    const { role, userId } = req.user;
    let filter = {};

    if (role === "manager") filter.createdBy = userId;
    if (role === "employee") filter.assignedTo = userId;
    if (role === "client") filter.clientId = userId;

    const projects = await Project.find(filter).populate([
      { path: "assignedTo", select: "username" },
      { path: "createdBy", select: "username" },
      { path: "clientId", select: "username fullname" },
    ]);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to get projects" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "clientId assignedTo"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.userId,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: "Failed to create project" });
  }
};

const updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update project" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Allow admin to delete any project, manager only their own
    if (role === "manager" && project.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: Only allowed to delete your own projects." });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete project" });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
