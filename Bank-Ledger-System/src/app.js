const express = require("express");
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/auth.route");
const accountRoute = require("./routes/account.routes");
const transactionRoute = require("./routes/transaction.route");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/accounts", accountRoute);
app.use("/api/transactions", transactionRoute);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal Server Error",
  });
});

module.exports = app;
