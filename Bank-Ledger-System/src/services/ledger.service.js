const ledgerModel = require("../models/ledger.model");

async function create(data, session = null) {
  const entry = await ledgerModel.create([data], { session });
  return entry[0];
}

module.exports = {
  create,
};
