import { body } from "express-validator";

export const reviewValidator = [
  body("product_id").notEmpty().withMessage("Product ID is required"),

  body("review").trim().notEmpty().withMessage("Review is required"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5")
];
