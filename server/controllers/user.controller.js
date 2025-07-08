const User = require("../models/user.model");

// Get all employees and clients
const getUsers = async (req, res) => {
  const users = await User.find({}, "username _id role fullname email status");
  const employees = users.filter(u => u.role === "employee");
  const clients = users.filter(u => u.role === "client");
  res.json({ employees, clients });
};


// Create user
const createUser = async (req, res) => {
  try {
    const { fullname, username, email, password, role, status = "active" } = req.body;

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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
