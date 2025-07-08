// models/progress.model.js
const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0) },
  percentDone: { type: Number, min: 0, max: 100, required: true },
  notes: { type: String, default: "" }
});

ProgressSchema.index({ projectId: 1, employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
