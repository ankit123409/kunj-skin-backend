import { body } from "express-validator";

export const productValidator = [
  body("image")
    .trim()
    .notEmpty()
    .withMessage("At least one product image is required"),

  body("images")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Images must be an array of URLs"),

  body("images.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Image URL cannot be empty"),

  body("title").trim().notEmpty().withMessage("Title is required"),
  body("size").trim().notEmpty().withMessage("Size is required"),
  body("actualMrp")
    .notEmpty()
    .withMessage("Actual MRP is required")
    .isFloat({ min: 0 })
    .withMessage("Actual MRP must be a positive number"),
  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),
  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
];
