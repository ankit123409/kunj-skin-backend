import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { productValidator } from "../validators/product.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { normalizeProductImages } from "../middleware/normalizeProduct.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  normalizeProductImages,
  productValidator,
  validate,
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  normalizeProductImages,
  productValidator,
  validate,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

export default router;
