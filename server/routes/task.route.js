const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");

// Task CRUD
router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Toggle subtask completion
router.patch("/:taskId/toggle-subtask", taskController.toggleSubtask);

module.exports = router;
