const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ["pending", "in progress", "completed"], default: "pending" },
  deadline: Date,
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  category: { type: String, enum: ["App", "Web", "ERP", "CRM"], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);
