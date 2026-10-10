import Product from "../models/Product.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const calcDiscount = (actualMrp, sellingPrice, discount) => {
  if (discount !== undefined && discount !== null && discount !== "") {
    return Number(discount);
  }

  const mrp = Number(actualMrp);
  const selling = Number(sellingPrice);

  if (!mrp || selling >= mrp) {
    return 0;
  }

  return Number((((mrp - selling) / mrp) * 100).toFixed(2));
};

const getPricing = (body) => {
  const actualMrp = Number(body.actualMrp ?? body.mrp);
  const sellingPrice = Number(body.sellingPrice);
  const discount = calcDiscount(actualMrp, sellingPrice, body.discount);

  return { actualMrp, sellingPrice, discount };
};

const resolveMedia = async (value, type) => {
  if (!value) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return uploadToCloudinary(value, type);
};

const getImageInputs = (body) => {
  if (Array.isArray(body.images) && body.images.length > 0) {
    return body.images;
  }

  if (Array.isArray(body.image) && body.image.length > 0) {
    return body.image;
  }

  if (typeof body.image === "string" && body.image.trim()) {
    return [body.image];
  }

  return [];
};

const resolveImages = async (body) => {
  const inputs = getImageInputs(body).filter(Boolean);
  const images = await Promise.all(
    inputs.map((item) => resolveMedia(item, "image"))
  );

  return {
    images,
    image: images[0] || ""
  };
};

export const createProduct = async (req, res, next) => {
  try {
    const { video, title, size, description } = req.body;
    const { actualMrp, sellingPrice, discount } = getPricing(req.body);
    const { image, images } = await resolveImages(req.body);

    if (!images.length) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required"
      });
    }

    const videoUrl = video ? await resolveMedia(video, "video") : video;

    const product = await Product.create({
      image,
      images,
      video: videoUrl,
      title,
      size,
      actualMrp,
      sellingPrice,
      discount,
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
    const { video, title, size, description } = req.body;
    const { actualMrp, sellingPrice, discount } = getPricing(req.body);
    const { image, images } = await resolveImages(req.body);

    if (!images.length) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required"
      });
    }

    const videoUrl = video ? await resolveMedia(video, "video") : video;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        image,
        images,
        video: videoUrl,
        title,
        size,
        actualMrp,
        sellingPrice,
        discount,
        description
      },
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
