import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

export class CouponError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const normalizeCouponCode = (code = "") =>
  String(code).trim().toUpperCase();

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const endOfUtcDay = (date) => {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

const startOfUtcDay = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

const isCouponInDateWindow = (coupon, now = new Date()) => {
  const start = startOfUtcDay(coupon.startDate);
  const end = endOfUtcDay(coupon.endDate);
  return now >= start && now <= end;
};

const getCouponProductIds = (coupon) => {
  if (Array.isArray(coupon.productIds) && coupon.productIds.length > 0) {
    return coupon.productIds.map((id) => id.toString());
  }

  if (coupon.productId) {
    return [coupon.productId.toString()];
  }

  return [];
};

const getEligibleSubtotal = (coupon, orderItems) => {
  const productIds = getCouponProductIds(coupon);

  if (productIds.length === 0) {
    return orderItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }

  return orderItems.reduce((sum, item) => {
    if (!productIds.includes(item.product.toString())) {
      return sum;
    }

    return sum + Number(item.price) * Number(item.quantity);
  }, 0);
};

const countCustomerUsage = async (couponId, userId) => {
  if (!userId) {
    return 0;
  }

  return Order.countDocuments({
    user: userId,
    couponId,
    paymentStatus: { $in: ["cod", "paid"] }
  });
};

export const calculateDiscount = (coupon, orderItems) => {
  const subtotal = roundMoney(
    orderItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    )
  );
  const eligibleSubtotal = roundMoney(getEligibleSubtotal(coupon, orderItems));
  let discountAmount = roundMoney(
    (eligibleSubtotal * Number(coupon.discountPercentage)) / 100
  );

  if (
    coupon.maximumDiscountAmount !== null &&
    coupon.maximumDiscountAmount !== undefined &&
    discountAmount > Number(coupon.maximumDiscountAmount)
  ) {
    discountAmount = roundMoney(coupon.maximumDiscountAmount);
  }

  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return {
    subtotal,
    eligibleSubtotal,
    discountPercentage: Number(coupon.discountPercentage),
    discountAmount,
    totalAmount: roundMoney(subtotal - discountAmount)
  };
};

export const validateCoupon = async ({
  code,
  orderItems,
  userId,
  now = new Date()
}) => {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    throw new CouponError("Coupon code is required");
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    throw new CouponError("Invalid coupon code", 404);
  }

  if (!coupon.isActive) {
    throw new CouponError("This coupon is inactive");
  }

  if (now < startOfUtcDay(coupon.startDate)) {
    throw new CouponError("This coupon is not active yet");
  }

  if (now > endOfUtcDay(coupon.endDate)) {
    throw new CouponError("This coupon has expired");
  }

  if (!isCouponInDateWindow(coupon, now)) {
    throw new CouponError("This coupon is not valid today");
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new CouponError("This coupon has reached its usage limit");
  }

  if (coupon.perCustomerLimit && userId) {
    const usedByCustomer = await countCustomerUsage(coupon._id, userId);

    if (usedByCustomer >= coupon.perCustomerLimit) {
      throw new CouponError("You have already used this coupon the maximum number of times");
    }
  }

  const totals = calculateDiscount(coupon, orderItems);

  if (totals.eligibleSubtotal <= 0) {
    throw new CouponError("This coupon is not valid for the selected products");
  }

  if (
    coupon.minimumOrderAmount &&
    totals.subtotal < Number(coupon.minimumOrderAmount)
  ) {
    throw new CouponError(
      `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`
    );
  }

  return {
    coupon,
    ...totals
  };
};

export const incrementCouponUsage = async (couponId) => {
  if (!couponId) {
    return null;
  }

  const coupon = await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
      ]
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  return coupon;
};

export const decrementCouponUsage = async (couponId) => {
  if (!couponId) {
    return null;
  }

  return Coupon.findOneAndUpdate(
    { _id: couponId, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } },
    { new: true }
  );
};

export const applyCouponToItems = async ({ code, orderItems, userId }) => {
  if (!code || !String(code).trim()) {
    const subtotal = roundMoney(
      orderItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      )
    );

    return {
      coupon: null,
      couponCode: null,
      couponId: null,
      discountPercentage: 0,
      discountAmount: 0,
      eligibleSubtotal: 0,
      subtotal,
      shippingAmount: 0,
      taxAmount: 0,
      totalAmount: subtotal
    };
  }

  const result = await validateCoupon({ code, orderItems, userId });

  return {
    coupon: result.coupon,
    couponCode: result.coupon.code,
    couponId: result.coupon._id,
    discountPercentage: result.discountPercentage,
    discountAmount: result.discountAmount,
    eligibleSubtotal: result.eligibleSubtotal,
    subtotal: result.subtotal,
    shippingAmount: 0,
    taxAmount: 0,
    totalAmount: result.totalAmount
  };
};

export const isDuplicateCouponError = (error) =>
  Number(error?.code) === 11000;
