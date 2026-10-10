import express from "express";
import {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponForCheckout
} from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import {
  couponValidator,
  couponValidateValidator
} from "../validators/coupon.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/validate",
  couponValidateValidator,
  validate,
  validateCouponForCheckout
);

router.post(
  "/",
  adminMiddleware,
  couponValidator,
  validate,
  createCoupon
);
router.get("/", adminMiddleware, getCoupons);
router.get("/:id", adminMiddleware, getCoupon);
router.put(
  "/:id",
  adminMiddleware,
  couponValidator,
  validate,
  updateCoupon
);
router.delete("/:id", adminMiddleware, deleteCoupon);

export default router;
