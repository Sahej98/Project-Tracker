const express = require("express");
const router = express.Router();
const controller = require("../controllers/dailyTask.controller");

router.post("/", controller.createOrUpdateDailyTasks);
router.get("/today/:userId", controller.getTodayReport);
router.put("/:id", controller.submitDailyReport);

module.exports = router;
