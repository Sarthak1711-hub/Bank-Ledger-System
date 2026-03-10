const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      immutable: true,
      index: true,
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
      index: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
      immutable: true,
    },

    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

function preventLedgerModification(next) {
  next(new Error("Ledger entries cannot be modified or deleted"));
}

ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

ledgerSchema.pre(
  "deleteOne",
  { document: true, query: false },
  preventLedgerModification
);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);
module.exports = ledgerModel;
