const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ["todo", "in progress", "done"], default: "todo" },
  deadline: Date,
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  category: { type: String, enum: ["App", "Web", "ERP", "CRM"], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);
