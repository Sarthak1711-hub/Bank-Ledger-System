const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function (session = null) {
  try {
    const balanceData = await ledgerModel
      .aggregate([
        { $match: { account: this._id } },
        {
          $group: {
            _id: null,
            totalDebits: {
              $sum: {
                $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
              },
            },
            totalCredits: {
              $sum: {
                $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            balance: { $subtract: ["$totalCredits", "$totalDebits"] },
          },
        },
      ])
      .session(session);

    return balanceData.length > 0 ? balanceData[0].balance : 0;
  } catch (error) {
    throw new Error("Error calculating account balance: " + error.message);
  }
};

const accountModel = mongoose.model("Account", accountSchema);

module.exports = accountModel;
