import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];

export const loginValidator = [
  body("mobile").trim().notEmpty().withMessage("Mobile number is required"),
  body("password").notEmpty().withMessage("Password is required")
];
