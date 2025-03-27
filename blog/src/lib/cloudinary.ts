import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// The upload function remains unchanged.
export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

const extractPublicIdFromUrl = (url: string): string | null => {
  const regex = /\/v\d+\/(.*?)\./;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getResourceTypeFromUrl = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "bmp", "tiff"].includes(extension)) {
    return "image";
  } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
    return "video";
  } else {
    return "raw";
  }
};

// Define an interface to type the Cloudinary destroy response.
export interface CloudinaryDestroyResponse {
  result: string;
}

export const deleteFromCloudinary = async (url: string): Promise<CloudinaryDestroyResponse> => {
  try {
    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) throw new Error("Invalid Cloudinary URL.");
    const resourceType = getResourceTypeFromUrl(url);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result as CloudinaryDestroyResponse;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};
