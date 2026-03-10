const userModel = require("../models/user.model");
const blacklistModel = require("../models/blacklistModel");
const jwt = require("jsonwebtoken");

async function userRegisterControllers(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await userModel.create({ email, password, name });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function userLoginControllers(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function userLogoutControllers(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await blacklistModel.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        message: "Already logged out",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token already expired",
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}

module.exports = {
  userRegisterControllers,
  userLoginControllers,
  userLogoutControllers,
};
