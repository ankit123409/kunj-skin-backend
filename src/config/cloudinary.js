import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file, resourceType = "image") => {
  if (!file) {
    throw new Error(`${resourceType === "video" ? "Video" : "Image"} is required`);
  }

  if (typeof file !== "string") {
    throw new Error(`${resourceType === "video" ? "Video" : "Image"} must be a string`);
  }

  if (file.startsWith("http://") || file.startsWith("https://")) {
    return file;
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: "ecommerce-products",
    resource_type: resourceType
  });

  return result.secure_url;
};
