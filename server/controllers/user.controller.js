const User = require("../models/user.model");

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    if (!["employee", "manager", "client"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const users = await User.find({ role }, "username _id role fullname email status");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

// Get all users (for admin dashboard)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username _id role fullname email status");
    const employees = users.filter(u => u.role === "employee");
    const clients = users.filter(u => u.role === "client");
    const managers = users.filter(u => u.role === "manager");
    res.json({ employees, clients, managers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

// Create user (can be used for employee, client, or manager)
const createUser = async (req, res) => {
  try {
    const { fullname, username, email, password, role, status = "active" } = req.body;
    if (!["employee", "manager", "client"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const newUser = await User.create({
      fullname,
      username,
      email,
      password,
      role,
      status,
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: "User creation failed", details: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Delete failed", details: err.message });
  }
};

module.exports = {
  getUsersByRole,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
