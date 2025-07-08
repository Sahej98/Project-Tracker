// routes/progress.route.js
const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  submitProgress,
  getProjectProgress
} = require("../controllers/progress.controller");

const router = express.Router();

router.post("/", auth(["employee"]), submitProgress);
router.get("/:projectId", auth(), getProjectProgress);

module.exports = router;
