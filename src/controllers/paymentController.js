import crypto from "crypto";
import Order from "../models/Order.js";
import razorpay from "../config/razorpay.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";
import { incrementCouponUsage } from "../services/couponService.js";

// Standalone Razorpay order (optional / testing)
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
      error: error.message
    });
  }
};

// After Razorpay checkout success — verify signature & confirm order
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing"
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this payment"
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Order already confirmed",
        data: order
      });
    }

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.status = "confirmed";

    if (order.couponId && !order.couponUsageCounted) {
      const updatedCoupon = await incrementCouponUsage(order.couponId);

      if (updatedCoupon) {
        order.couponUsageCounted = true;
      }
    }

    await order.save();

    console.log("Order created successfully");

    try {
      await sendOrderConfirmationEmail(order);
      console.log("Order confirmation email sent successfully");
    } catch (emailError) {
      console.error("Order confirmation email failed");
      console.error("Order email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order placed successfully",
      data: order
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};
