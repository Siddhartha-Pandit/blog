// src/app/utils/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


export const uploadImage = async (
  file: string | Buffer,
  folder = "jotion"
): Promise<{ url: string; publicId: string }> => {
  try {
    let fileData: string;

    if (Buffer.isBuffer(file)) {
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

/**
 * Delete an image from Cloudinary by public ID.
 * @param publicId - Public ID of the image to delete
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    throw err;
  }
};

/**
 * Update an existing image:
 * Deletes the old image and uploads the new one.
 * @param newFile - Base64 string or Buffer for the new image
 * @param oldPublicId - Public ID of the old image to replace
 * @param folder - Folder name in Cloudinary
 */
export const updateImage = async (
  newFile: string | Buffer,
  oldPublicId: string,
  folder = "jotion"
): Promise<{ url: string; publicId: string }> => {
  try {
    // Delete old image first
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    // Upload new one
    const result = await uploadImage(newFile, folder);
    return result;
  } catch (err) {
    console.error("Cloudinary Update Error:", err);
    throw err;
  }
};
