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
      { path: "clientId", select: "username fullname" }, // ✅ both username and full name
    ]);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to get projects" });
  }
};

const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    "clientId assignedTo"
  );
  res.json(project);
};

// Create a new project
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

// Update a project
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

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    await Task.deleteMany({ projectId });
    await Project.findByIdAndDelete(req.params.id);
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
