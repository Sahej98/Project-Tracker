require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const projectRoutes = require("./routes/project.route");
const userRoutes = require("./routes/user.route");
const taskRoutes = require("./routes/task.route");
const dailyTaskRoutes = require("./routes/dailyTask.routes");


const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected"));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/daily-tasks", dailyTaskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
