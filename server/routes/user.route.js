// routes/user.route.js
const router = require("express").Router();
const User = require("../models/user.model");
const auth = require("../middlewares/auth.middleware");

// return only employees and clients
router.get("/", auth(["admin", "manager"]), async (req, res) => {
  const users = await User.find({}, "username _id role fullname");
  const employees = users.filter(u => u.role === "employee");
  const clients = users.filter(u => u.role === "client");

  res.json({ employees, clients });
});

module.exports = router;
