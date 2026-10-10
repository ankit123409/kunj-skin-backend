import { body } from "express-validator";

const dateFields = (prefix = "") => [
  body(`${prefix}startDate`)
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body(`${prefix}endDate`)
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      const startDate = req.body.startDate;
      if (startDate && new Date(endDate) < new Date(startDate)) {
        throw new Error("End date cannot be before start date");
      }
      return true;
    })
];

export const couponValidator = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),

  body("productIds")
    .optional({ values: "falsy" })
    .isArray()
    .withMessage("productIds must be an array"),

  body("productIds.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("productId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Invalid product ID"),

  ...dateFields(),

  body("discountPercentage")
    .notEmpty()
    .withMessage("Discount percentage is required")
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount percentage must be between 1 and 100"),

  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),

  body("minimumOrderAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be 0 or more"),

  body("maximumDiscountAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Maximum discount amount must be 0 or more"),

  body("usageLimit")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Usage limit must be at least 1"),

  body("perCustomerLimit")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Per customer limit must be at least 1")
];

export const couponValidateValidator = [
  body("couponCode").trim().notEmpty().withMessage("Coupon code is required"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one order item is required"),

  body("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1")
];
