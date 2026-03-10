const accountModel = require("../models/account.model");
const mongoose = require("mongoose");
// -------- CREATE ACCOUNT --------
async function createAccountController(req, res) 
{
  try 
  {
    // 1. Get current user
    const user = req.user;
    // 2. Check if user already has an account
    const existingAccount = await accountModel.findOne({user: user._id});
    if (existingAccount) 
    {
      return res.status(400).json({message: "Account already exists"});
    }
    // 3. Create a new account
    const account = await accountModel.create({user: user._id});
    // 4. Send success response
    return res.status(201).json({message: "Account created successfully",account: account});

  } 
  catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to create account"
    });

  }
}
// -------- GET ACCOUNT --------
async function getAccountController(req, res) 
{
  try 
  {
    // 1. Get current user
    const user = req.user;
    // 2. Find the user's account
    const account = await accountModel.findOne({user: user._id});
    // 3. If account doesn't exist
    if (!account) 
    {
      return res.status(404).json({message: "Account not found"});
    }
    // 4. Send account data
    return res.status(200).json({account: account});

  } 
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({message: "Failed to fetch account"});
  }
}
// -------- GET ACCOUNT BALANCE --------
async function getAccountBalanceController(req, res) {
  try {
    // 1. Get current user
    const user = req.user;
    // 2. Get account ID from URL
    const accountID = req.params.accountID;
    // 3. Check if ID format is valid
    if (!mongoose.Types.ObjectId.isValid(accountID)) 
    {
      return res.status(400).json({message: "Invalid account ID"});
    }
    // 4. Find account that belongs to this user
    const account = await accountModel.findOne({_id: accountID,user: user._id});
    // 5. If account doesn't exist
    if (!account) 
    {
      return res.status(404).json({message: "Account not found"});
    }
    // 6. Get balance from model
    const balance = await account.getBalance();
    // 7. Send balance
    return res.status(200).json({balance: balance});
  } 
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({message: "Failed to fetch balance"});
  }
}
module.exports = 
{
  createAccountController,
  getAccountController,
  getAccountBalanceController
};

// const accountModel = require("../models/account.model");
// const mongoose = require("mongoose");
// // ---------------- CREATE ACCOUNT ----------------
// async function createAccountController(req, res) {
//   try {
//     const user = req.user;

//     // Optional: Prevent duplicate account
//     const existingAccount = await accountModel.findOne({ user: user._id });
//     if (existingAccount) {
//       return res.status(400).json({
//         message: "Account already exists",
//       });
//     }

//     const account = await accountModel.create({
//       user: user._id,
//     });

//     return res.status(201).json({
//       message: "Account created successfully",
//       account,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to create account",
//     });
//   }
// }
// // ---------------- GET ACCOUNT ----------------
// async function getAccountController(req, res) {
//   try {
//     const user = req.user;

//     const account = await accountModel.findOne({ user: user._id });

//     if (!account) {
//       return res.status(404).json({
//         message: "Account not found",
//       });
//     }

//     return res.status(200).json({ account });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to fetch account",
//     });
//   }
// }


// // ---------------- GET ACCOUNT BALANCE ----------------
// async function getAccountBalanceController(req, res) {
//   try {
//     const user = req.user;

//     // correct param
//     const accountID = req.params.accountID;

//     console.log("Params received:", req.params);
//     console.log("AccountID:", accountID);

//     if (!mongoose.Types.ObjectId.isValid(accountID)) {
//       return res.status(400).json({
//         message: "Invalid account ID",
//       });
//     }

//     const account = await accountModel.findOne({
//       _id: accountID,
//       user: user._id,
//     });

//     if (!account) {
//       return res.status(404).json({
//         message: "Account not found",
//       });
//     }

//     const balance = await account.getBalance();

//     return res.status(200).json({
//       balance,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to fetch balance",
//     });
//   }
// }
// module.exports = {
//   createAccountController,
//   getAccountController,
//   getAccountBalanceController,
// };