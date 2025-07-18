const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "manager", "employee", "client"],
    default: "client",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  }
});

module.exports = mongoose.model("User", UserSchema);
