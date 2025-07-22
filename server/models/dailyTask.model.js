const mongoose = require("mongoose");

const dailyTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  tasks: [
    {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
      subtaskIndex: { type: Number, required: true },
      taskTitle: { type: String, required: true },
      subtaskTitle: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "in progress", "completed"],
        default: "pending",
      },
      remarks: { type: String, default: "" },
      timeSpent: { type: String, default: "" }, // ✅ NEW FIELD
    },
  ],
}, { timestamps: true });

dailyTaskSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyTask", dailyTaskSchema);
