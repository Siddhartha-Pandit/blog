// src/app/utils/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (file: string | Buffer, folder = "jotion") => {
  try {
    let fileData: string;

    if (Buffer.isBuffer(file)) {
      // Convert Buffer to Base64 data URL
      fileData = `data:image/jpeg;base64,${file.toString("base64")}`;
    } else {
      fileData = file; // Already a base64 string or URL
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    throw err;
  }
};
