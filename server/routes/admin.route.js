const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// Dashboard Stats
router.get("/stats", adminController.getDashboardStats);
router.get("/stats/time", adminController.getTimeStats);
router.get("/stats/tasks-per-week", adminController.getTasksPerWeek);
router.get("/stats/projects-per-week", adminController.getProjectsPerWeek);

module.exports = router;
