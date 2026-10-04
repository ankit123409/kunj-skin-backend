import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import razorpay from "../config/razorpay.js";

const PAYMENT_TYPE = {
  CASH: 1,
  CARD: 2,
  UPI: 3
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, address, paymentType } = req.body;
    const type = Number(paymentType);

    if (![PAYMENT_TYPE.CASH, PAYMENT_TYPE.CARD, PAYMENT_TYPE.UPI].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Payment type must be 1 (cash), 2 (card), or 3 (upi)"
      });
    }

    const productIds = items.map((item) => item.product);

    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const products = await Product.find({
      _id: { $in: productIds }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products were not found"
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      const quantity = Number(item.quantity);

      orderItems.push({
        product: product._id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity
      });

      totalAmount += product.price * quantity;
    }

    // Cash on delivery — place order immediately
    if (type === PAYMENT_TYPE.CASH) {
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        address,
        totalAmount,
        paymentType: type,
        paymentStatus: "cod",
        status: "pending"
      });

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: order
      });
    }

    // Card (2) or UPI (3) — create Razorpay order, then return details for checkout
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        paymentType: String(type)
      }
    });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      address,
      totalAmount,
      paymentType: type,
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Payment initiated. Complete payment to confirm order.",
      data: {
        order,
        razorpay: {
          key: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          paymentType: type
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name mobile")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name mobile"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const isOwner =
      order.user._id.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot access this order"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled"
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};
