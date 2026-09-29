import Product from "../models/Product.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createProduct = async (req, res, next) => {
  try {
    const { image, video, title, size, price, description } = req.body;

    let imageUrl = image;
    let videoUrl = video;

    if (image && !/^https?:\/\//i.test(image)) {
      imageUrl = await uploadToCloudinary(image, "image");
    }

    if (video && !/^https?:\/\//i.test(video)) {
      videoUrl = await uploadToCloudinary(video, "video");
    }

    const product = await Product.create({
      image: imageUrl,
      video: videoUrl,
      title,
      size,
      price,
      description
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
