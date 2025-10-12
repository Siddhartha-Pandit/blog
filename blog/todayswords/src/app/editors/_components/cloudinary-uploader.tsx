"use client";

import React, { useState } from "react";
import { uploadImage } from "@/app/utils/cloudinary";
import { toast } from "sonner";

interface CloudinaryUploaderProps {
  folder?: string; // Optional Cloudinary folder
  onUploadComplete?: (url: string) => void; // Callback after upload
  disabled?: boolean;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  folder = "jotion",
  onUploadComplete,
  disabled = false,
}) => {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (disabled) return;
    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Upload to Cloudinary
      const { url } = await uploadImage(fileData, folder); // Destructure url

      // Show preview
      setPreviewUrl(url);

      // Trigger callback
      onUploadComplete?.(url);

      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer transition-colors ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        <p className="text-sm text-muted-foreground text-center">
          {isUploading
            ? "Uploading..."
            : "Drag & drop an image here or click to select"}
        </p>
        <input
          type="file"
          accept="image/*"
          className="absolute w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || isUploading}
          onChange={handleChange}
        />
      </div>

      {previewUrl && (
        <div className="w-full mt-2 flex justify-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 rounded-md object-contain border"
          />
        </div>
      )}
    </div>
  );
};
