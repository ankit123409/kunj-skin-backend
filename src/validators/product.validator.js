import { body } from "express-validator";

export const productValidator = [
  body("image").trim().notEmpty().withMessage("Image is required"),

  body("title").trim().notEmpty().withMessage("Title is required"),
  body("size").trim().notEmpty().withMessage("Size is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
];
