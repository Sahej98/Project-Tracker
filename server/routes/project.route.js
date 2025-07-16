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

router.get("/", auth(), getProjects); // all authenticated users (role-based filter in controller)
router.get("/:id", auth(), getProjectById);

// Only admin or manager can create or update
router.post("/", auth(["admin", "manager"]), createProject);
router.put("/:id", auth(["admin", "manager"]), updateProject);
router.delete("/:id", auth(["admin", "manager"]), deleteProject);

module.exports = router;
