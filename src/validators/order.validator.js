import { body } from "express-validator";

export const orderValidator = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one order item is required"),

  body("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("address.name")
    .trim()
    .notEmpty()
    .withMessage("Address name is required"),

  body("address.mobile")
    .trim()
    .notEmpty()
    .withMessage("Address mobile is required"),

  body("address.addressLine1")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("address.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("address.state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("address.pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
];
