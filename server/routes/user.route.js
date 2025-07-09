const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Shared user endpoints
router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Get users by role: /users/role/employee, /users/role/manager, etc.
router.get("/role/:role", userController.getUsersByRole);

module.exports = router;
