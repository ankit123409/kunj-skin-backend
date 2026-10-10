import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },
    productIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        }
      ],
      default: []
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    },
    minimumOrderAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    maximumDiscountAmount: {
      type: Number,
      min: 0,
      default: null
    },
    usageLimit: {
      type: Number,
      min: 1,
      default: null
    },
    usedCount: {
      type: Number,
      min: 0,
      default: 0
    },
    perCustomerLimit: {
      type: Number,
      min: 1,
      default: null
    }
  },
  { timestamps: true }
);

couponSchema.pre("validate", function () {
  if (this.code) {
    this.code = String(this.code).trim().toUpperCase();
  }

  if ((!this.productIds || this.productIds.length === 0) && this.productId) {
    this.productIds = [this.productId];
  }

  if (this.productIds?.length) {
    this.productId = this.productIds[0];
  } else {
    this.productId = null;
  }

  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "End date cannot be before start date");
  }
});

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ productId: 1, isActive: 1 });
couponSchema.index({ productIds: 1, isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Coupon", couponSchema);
