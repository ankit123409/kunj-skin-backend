import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import {
  applyCouponToItems,
  CouponError,
  isDuplicateCouponError,
  normalizeCouponCode
} from "../services/couponService.js";

const optionalNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return Number(value);
};

const getProductIdsFromBody = (body) => {
  if (Array.isArray(body.productIds) && body.productIds.length > 0) {
    return [...new Set(body.productIds.filter(Boolean))];
  }

  if (body.productId) {
    return [body.productId];
  }

  return [];
};

const buildCouponPayload = (body) => {
  const productIds = getProductIdsFromBody(body);

  return {
    productIds,
    productId: productIds[0] || null,
    code: normalizeCouponCode(body.code),
    startDate: body.startDate,
    endDate: body.endDate,
    discountPercentage: Number(body.discountPercentage),
    isActive:
      body.isActive === undefined
        ? true
        : body.isActive === true || body.isActive === "true",
    minimumOrderAmount: Number(body.minimumOrderAmount || 0),
    maximumDiscountAmount: optionalNumber(body.maximumDiscountAmount),
    usageLimit: optionalNumber(body.usageLimit),
    perCustomerLimit: optionalNumber(body.perCustomerLimit)
  };
};

const ensureProductsExist = async (productIds) => {
  if (!productIds?.length) {
    return;
  }

  if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new CouponError("Invalid product ID");
  }

  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    throw new CouponError("One or more products were not found", 404);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const payload = buildCouponPayload(req.body);
    await ensureProductsExist(payload.productIds);

    const coupon = await Coupon.create(payload);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon
    });
  } catch (error) {
    if (isDuplicateCouponError(error)) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    if (error instanceof CouponError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .populate("productId", "title sellingPrice actualMrp image")
      .populate("productIds", "title sellingPrice actualMrp image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID"
      });
    }

    const coupon = await Coupon.findById(req.params.id)
      .populate("productId", "title sellingPrice actualMrp image")
      .populate("productIds", "title sellingPrice actualMrp image");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID"
      });
    }

    const payload = buildCouponPayload(req.body);
    await ensureProductsExist(payload.productIds);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon
    });
  } catch (error) {
    if (isDuplicateCouponError(error)) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    if (error instanceof CouponError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID"
      });
    }

    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const validateCouponForCheckout = async (req, res, next) => {
  try {
    const { couponCode, items } = req.body;

    const productIds = items.map((item) => item.product);

    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products were not found"
      });
    }

    const orderItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      return {
        product: product._id,
        price: Number(product.sellingPrice ?? product.price ?? 0),
        quantity: Number(item.quantity)
      };
    });

    const result = await applyCouponToItems({
      code: couponCode,
      orderItems,
      userId: req.user._id
    });

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: result.couponCode,
        discountPercentage: result.discountPercentage,
        discountAmount: result.discountAmount,
        eligibleSubtotal: result.eligibleSubtotal,
        subtotal: result.subtotal,
        shippingAmount: result.shippingAmount,
        taxAmount: result.taxAmount,
        totalAmount: result.totalAmount
      }
    });
  } catch (error) {
    if (error instanceof CouponError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};
