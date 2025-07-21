const express = require("express");
const router = express.Router();
const controller = require("../controllers/dailyTask.controller");
const auth = require("../middlewares/auth.middleware");

// Employee creates or updates today's tasks
router.post(
  "/",
  auth(["employee"]),
  controller.createOrUpdateDailyTasks
);

// Employee, Manager, Admin can get today's report for a specific user
router.get(
  "/today/:userId",
  auth(["employee", "admin", "manager"]),
  controller.getTodayReport
);

// Admin and Manager can get all employees' reports
router.get(
  "/today",
  auth(["admin", "manager"]),
  controller.getAllTodayReports
);

// Employee submits (updates) their daily report (status, remarks)
router.put(
  "/:id",
  auth(["employee"]),
  controller.submitDailyReport
);

// 🆕 Admin / Manager View - Get All Employee Reports for a Date
router.get('/admin/reports', controller.getAllReports);

module.exports = router;
