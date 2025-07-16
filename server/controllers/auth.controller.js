const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Register User
const registerUser = async (req, res) => {
  try {
    const { fullname, username, email, password, role } = req.body;

    // check if user/email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname,
      username,
      email,
      password: hashed,
      role,
      status: "active",
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// ✅ Login User (via username or email)
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username, fullname: user.fullname },
      JWT_SECRET
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { registerUser, loginUser };
