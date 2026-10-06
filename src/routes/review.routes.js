import express from "express";
import {
  addReview,
  getReviews,
  getReviewsByProduct,
  deleteReview
} from "../controllers/review.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { reviewValidator } from "../validators/review.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/product/:productId", getReviewsByProduct);

router.post("/", authMiddleware, reviewValidator, validate, addReview);

router.delete("/:id", authMiddleware, adminMiddleware, deleteReview);

export default router;
