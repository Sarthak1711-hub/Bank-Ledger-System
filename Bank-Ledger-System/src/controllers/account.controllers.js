const accountModel = require("../models/account.model");
const mongoose = require("mongoose");
async function createAccountController(req, res) {
  try {
    const user = req.user;
    const existingAccount = await accountModel.findOne({ user: user._id });
    if (existingAccount) {
      return res.status(400).json({
        message: "Account already exists",
      });
    }

    const account = await accountModel.create({
      user: user._id,
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create account",
    });
  }
}

async function getAccountController(req, res) {
  try {
    const user = req.user;

    const account = await accountModel.findOne({ user: user._id });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({ account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch account",
    });
  }
}

async function getAccountBalanceController(req, res) {
  try {
    const user = req.user;
    const accountID = req.params.accountID;

    console.log("Params received:", req.params);
    console.log("AccountID:", accountID);

    if (!mongoose.Types.ObjectId.isValid(accountID)) {
      return res.status(400).json({
        message: "Invalid account ID",
      });
    }

    const account = await accountModel.findOne({
      _id: accountID,
      user: user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      balance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch balance",
    });
  }
}
module.exports = {
  createAccountController,
  getAccountController,
  getAccountBalanceController,
};
