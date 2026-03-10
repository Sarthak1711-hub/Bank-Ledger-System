const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountControllers = require("../controllers/account.controllers");

const router = express.Router();

router.post(
  "/",
  authMiddleware.authMiddleware,
  accountControllers.createAccountController
);

router.get(
  "/",
  authMiddleware.authMiddleware,
  accountControllers.getAccountController
);

router.get(
  "/:accountID/balance",
  authMiddleware.authMiddleware,
  accountControllers.getAccountBalanceController
);

module.exports = router;
