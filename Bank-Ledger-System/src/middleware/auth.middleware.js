const userModel = require("../models/user.model");
const blacklistModel = require("../models/blacklistModel");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret not configured",
      });
    }
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const isBlacklisted = await blacklistModel.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token is invalid",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    console.error(error);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

module.exports = {
  authMiddleware,
};
