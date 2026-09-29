import express from "express";
import {
  register,
  login,
  profile
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator
} from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/profile", authMiddleware, profile);

export default router;
