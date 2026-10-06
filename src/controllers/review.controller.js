import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const addReview = async (req, res, next) => {
  try {
    const { product_id, review, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const existing = await Review.findOne({
      user_id: req.user._id,
      product_id
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product"
      });
    }

    const newReview = await Review.create({
      user_id: req.user._id,
      product_id,
      review,
      rating: Number(rating)
    });

    const populated = await Review.findById(newReview._id)
      .populate("user_id", "name mobile")
      .populate("product_id", "title image price");

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("user_id", "name mobile")
      .populate("product_id", "title image price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const reviews = await Review.find({ product_id: productId })
      .populate("user_id", "name mobile")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, item) => sum + item.rating, 0) /
              reviews.length
            ).toFixed(1)
          );

    res.json({
      success: true,
      count: reviews.length,
      averageRating: avgRating,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
