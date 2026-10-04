import express from "express";
import {
  createOrder,
  verifyPayment
} from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

export default router;
