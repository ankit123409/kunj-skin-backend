import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (image) => {
  if (!image) {
    throw new Error("Image is required");
  }

  if (typeof image !== "string") {
    throw new Error("Image must be a string");
  }

  // If image is already a Cloudinary or remote URL, keep it as-is.
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: "ecommerce-products",
    resource_type: "image"
  });

  return result.secure_url;
};
