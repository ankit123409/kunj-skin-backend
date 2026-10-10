import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  cancelMyOrder
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { orderValidator } from "../validators/order.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", orderValidator, validate, createOrder);
router.get("/my", getMyOrders);
router.get("/admin/all", adminMiddleware, getAllOrders);
router.patch("/admin/status", adminMiddleware, bulkUpdateOrderStatus);
router.get("/:id", getOrderById);
router.patch("/:id/status", adminMiddleware, updateOrderStatus);
router.patch("/:id/cancel", cancelMyOrder);

export default router;
