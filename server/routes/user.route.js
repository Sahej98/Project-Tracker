const express = require("express");
const adminController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const router = express.Router();

// Only admin access
router.get("/", auth(["admin"]), adminController.getUsers);
router.post("/", auth(["admin"]), adminController.createUser);
router.put("/:id", auth(["admin"]), adminController.updateUser);
router.delete("/:id", auth(["admin"]), adminController.deleteUser);

module.exports = router;
