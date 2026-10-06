import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    const { name, mobile, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ mobile }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      const message =
        existingUser.mobile === mobile
          ? "Mobile number already registered"
          : "Email already registered";

      return res.status(409).json({
        success: false,
        message
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      mobile: req.user.mobile,
      email: req.user.email,
      role: req.user.role
    }
  });
};
