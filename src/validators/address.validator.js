import { body } from "express-validator";

export const addressValidator = [
  body("name").trim().notEmpty().withMessage("Address name is required"),

  body("mobile").trim().notEmpty().withMessage("Address mobile is required"),

  body("addressLine1").trim().notEmpty().withMessage("Address is required"),

  body("addressLine2").optional().trim(),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("pincode").trim().notEmpty().withMessage("Pincode is required")
];
