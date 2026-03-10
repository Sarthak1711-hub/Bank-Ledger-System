const transactionModel = require("../models/transaction.model");
const ledgerService = require("../services/ledger.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

// =====================================
// CREATE NORMAL TRANSACTION
// =====================================
async function createTransaction(req, res) {
  const session = await mongoose.startSession();
  try 
  {
    session.startTransaction();
    const { fromAccount, toAccount, amount, idempotency } = req.body;
    // ---------- VALIDATION ----------
    if (!fromAccount || !toAccount || !amount || !idempotency) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(fromAccount) || !mongoose.Types.ObjectId.isValid(toAccount)) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid account ID" });
    }

    if (fromAccount === toAccount)
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cannot transfer to same account" });
    }
    if (amount <= 0) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }
    // ---------- IDEMPOTENCY CHECK ----------
    const existingTransaction = await transactionModel.findOne({idempotencyKey: idempotency});

    if (existingTransaction) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({message: "Transaction already exists",transaction: existingTransaction});
    }
    // ---------- FETCH ACCOUNTS ----------
    const senderAccount = await accountModel.findById(fromAccount).session(session);
    const receiverAccount = await accountModel.findById(toAccount).session(session);

    if (!senderAccount || !receiverAccount) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Account not found" });
    }

    if (senderAccount.status !== "active" || receiverAccount.status !== "active") 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Both accounts must be active" });
    }
    // ---------- BALANCE CHECK ----------
    const senderBalance = await senderAccount.getBalance(session);

    if (senderBalance < amount) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient funds" });
    }
    // ---------- CREATE TRANSACTION ----------
    const createdTransactionArray = await transactionModel.create(
      [{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey: idempotency,
        status: "pending"
      }],{ session }
    );

    const createdTransaction = createdTransactionArray[0];
    // ---------- DEBIT SENDER ----------
    await ledgerService.create(
      {
        account: fromAccount,
        type: "debit",
        amount,
        transaction: createdTransaction._id
      },
      session
    );
    // ---------- CREDIT RECEIVER ----------
    await ledgerService.create(
      {
        account: toAccount,
        type: "credit",
        amount,
        transaction: createdTransaction._id
      },
      session
    );
    // ---------- MARK TRANSACTION COMPLETE ----------
    createdTransaction.status = "completed";
    await createdTransaction.save({ session });
    // ---------- COMMIT ----------
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({message: "Transaction successful",transaction: createdTransaction});
  } 
  catch (error) 
  {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) 
    {
      return res.status(400).json({message: "Duplicate idempotency key"});
    }

    console.error(error);
    return res.status(500).json({message: "Transaction failed"});
  }
}
// =====================================
// INITIAL FUNDING
// =====================================
async function createInitialTransactionFunds(req, res) 
{
  const session = await mongoose.startSession();
  try 
  {
    session.startTransaction();
    const { toAccount, amount } = req.body;

    // ---------- VALIDATION ----------
    if (!toAccount || !amount) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({message: "toAccount and amount required"});
    }
    if (!mongoose.Types.ObjectId.isValid(toAccount)) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({message: "Invalid account ID"});
    }
    if (amount <= 0) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({message: "Amount must be greater than zero"});
    }
    // ---------- FETCH ACCOUNT ----------
    const receiverAccount = await accountModel.findById(toAccount).session(session);
    if (!receiverAccount) 
    {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({message: "Account not found"});
    }
    // ---------- ADD FUNDS ----------
    await ledgerService.create(
      {
        account: toAccount,
        type: "credit",
        amount,
        transaction: null
      },
      session
    );
    // ---------- COMMIT ----------
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({message: "Initial funds added successfully"});

  } 
  catch (error) 
  {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({message: "Failed to add initial funds"});
  }
}
module.exports = {
  createTransaction,
  createInitialTransactionFunds
};


// const transactionModel = require("../models/transaction.model");
// const ledgerService = require("../services/ledger.service");
// const accountModel = require("../models/account.model");
// const mongoose = require("mongoose");


// // =====================================
// // CREATE NORMAL TRANSACTION
// // =====================================
// async function createTransaction(req, res) {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { fromAccount, toAccount, amount, idempotency } = req.body;

//     // ---------------- VALIDATIONS ----------------
//     if (!fromAccount || !toAccount || !amount || !idempotency) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (
//       !mongoose.Types.ObjectId.isValid(fromAccount) ||
//       !mongoose.Types.ObjectId.isValid(toAccount)
//     ) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Invalid account ID" });
//     }

//     if (fromAccount === toAccount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "Cannot transfer to same account",
//       });
//     }

//     if (amount <= 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "Amount must be greater than zero",
//       });
//     }

//     // ---------------- IDEMPOTENCY ----------------
//     const existingTransaction = await transactionModel.findOne({
//       idempotencyKey: idempotency,
//     });

//     if (existingTransaction) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(200).json({
//         message: "Transaction already exists",
//         transaction: existingTransaction,
//       });
//     }

//     // ---------------- FETCH ACCOUNTS ----------------
//     const senderAccount = await accountModel
//       .findById(fromAccount)
//       .session(session);

//     const receiverAccount = await accountModel
//       .findById(toAccount)
//       .session(session);

//     if (!senderAccount || !receiverAccount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Account not found" });
//     }

//     if (
//       senderAccount.status !== "active" ||
//       receiverAccount.status !== "active"
//     ) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "Both accounts must be active",
//       });
//     }

//     // ---------------- BALANCE CHECK (SESSION SAFE) ----------------
//     const senderBalance = await senderAccount.getBalance(session);

//     if (senderBalance < amount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Insufficient funds" });
//     }

//     // ---------------- CREATE TRANSACTION ----------------
//     const createdTransactionArray = await transactionModel.create(
//       [
//         {
//           fromAccount,
//           toAccount,
//           amount,
//           idempotencyKey: idempotency,
//           status: "pending",
//         },
//       ],
//       { session }
//     );

//     const createdTransaction = createdTransactionArray[0];

//     // ---------------- DEBIT SENDER ----------------
//     await ledgerService.create(
//       {
//         account: fromAccount,
//         type: "debit",
//         amount,
//         transaction: createdTransaction._id,
//       },
//       session
//     );

//     // ---------------- CREDIT RECEIVER ----------------
//     await ledgerService.create(
//       {
//         account: toAccount,
//         type: "credit",
//         amount,
//         transaction: createdTransaction._id,
//       },
//       session
//     );

//     // ---------------- MARK COMPLETED ----------------
//     createdTransaction.status = "completed";
//     await createdTransaction.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       message: "Transaction successful",
//       transaction: createdTransaction,
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: "Duplicate idempotency key",
//       });
//     }

//     console.error(error);
//     return res.status(500).json({
//       message: "Transaction failed",
//     });
//   }
// }



// // =====================================
// // INITIAL FUNDING
// // =====================================
// async function createInitialTransactionFunds(req, res) {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { toAccount, amount } = req.body;

//     if (!toAccount || !amount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "toAccount and amount required",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(toAccount)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "Invalid account ID",
//       });
//     }

//     if (amount <= 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "Amount must be greater than zero",
//       });
//     }

//     const receiverAccount = await accountModel
//       .findById(toAccount)
//       .session(session);

//     if (!receiverAccount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: "Account not found",
//       });
//     }

//     await ledgerService.create(
//       {
//         account: toAccount,
//         type: "credit",
//         amount,
//         transaction: null,
//       },
//       session
//     );

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       message: "Initial funds added successfully",
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to add initial funds",
//     });
//   }
// }

// module.exports = {
//   createTransaction,
//   createInitialTransactionFunds,
// };