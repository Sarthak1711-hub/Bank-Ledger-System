const express = require("express");
const authControllers = require("../controllers/auth.controllers");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authControllers.userRegisterControllers);

router.post("/login", authControllers.userLoginControllers);

router.post(
  "/logout",
  authMiddleware.authMiddleware,
  authControllers.userLogoutControllers
);

module.exports = router;
