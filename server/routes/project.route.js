const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.get("/", auth(), getProjects);
router.get("/:id", auth(), getProjectById);
router.post("/", auth(["admin", "manager"]), createProject);
router.put("/:id", auth(["admin", "manager", "employee"]), updateProject);
router.delete("/:id", auth(["admin"]), deleteProject);

module.exports = router;
