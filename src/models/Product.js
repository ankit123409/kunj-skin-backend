import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    video: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: String,
      required: true,
      trim: true
    },
    actualMrp: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

productSchema.pre("validate", function () {
  if ((!this.images || this.images.length === 0) && this.image) {
    this.images = [this.image];
  }

  if (!this.image && this.images?.length) {
    this.image = this.images[0];
  }
});

const mapProduct = (_doc, ret) => {
  ret.actualMrp = ret.actualMrp ?? ret.price ?? 0;
  ret.sellingPrice = ret.sellingPrice ?? ret.price ?? 0;
  ret.discount = ret.discount ?? 0;
  ret.images =
    Array.isArray(ret.images) && ret.images.length > 0
      ? ret.images
      : ret.image
        ? [ret.image]
        : [];
  ret.image = ret.images[0] || ret.image || "";
  delete ret.price;
  return ret;
};

productSchema.set("toJSON", { transform: mapProduct });
productSchema.set("toObject", { transform: mapProduct });

export default mongoose.model("Product", productSchema);
