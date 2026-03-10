const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
      immutable: true,
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
      immutable: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre("validate", function () {
  if (
    this.fromAccount &&
    this.toAccount &&
    this.fromAccount.equals(this.toAccount)
  ) {
    return next(new Error("Cannot transfer to same account"));
  }
});

function preventTransactionModification(next) {
  next(new Error("Direct modification of transactions is not allowed"));
}

transactionSchema.pre("updateOne", preventTransactionModification);
transactionSchema.pre("updateMany", preventTransactionModification);
transactionSchema.pre("deleteOne", preventTransactionModification);
transactionSchema.pre("deleteMany", preventTransactionModification);
transactionSchema.pre("findOneAndDelete", preventTransactionModification);
transactionSchema.pre("findOneAndReplace", preventTransactionModification);

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
