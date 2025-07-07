const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.get("/", auth(), getProjects);
router.post("/", auth(["admin", "manager"]), createProject);
router.put("/:id", auth(["admin", "manager", "employee"]), updateProject);
router.delete("/:id", auth(["admin"]), deleteProject);

module.exports = router;
