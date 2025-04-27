"use client";

import React, { useState, useRef, useEffect } from "react";
import { ImageUp, Trash } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  /**
   * Called when a new image File is selected or removed.
   * If the user clears the image, `null` is passed.
   */
  onFileAccepted?: (file: File | null) => void;
  /**
   * Optional initial image URL to display as preview.
   */
  src?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileAccepted, src }) => {
  // Holds the newly selected File (if any)
  const [image, setImage] = useState<File | null>(null);
  // Preview URL: either object URL of `image` or the provided `src`
  const [preview, setPreview] = useState<string | null>(src || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      // Generate object URL for preview
      const objectUrl = URL.createObjectURL(image);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    // Fallback to initial src when no file is selected
    setPreview(src || null);
  }, [image, src]);

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isImageFile(file)) {
      setImage(file);
      onFileAccepted?.(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isImageFile(file)) {
      setImage(file);
      onFileAccepted?.(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  const removeImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImage(null);
    onFileAccepted?.(null);
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-md p-4 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-400 border-gray-300 bg-gray-100 hover:border-gray-500 transition-all"
    >
      {preview ? (
        <div className="relative w-full h-[300px]">
          <Image
            src={preview}
            alt="Preview"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-md"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white"
            aria-label="Remove image"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <ImageUp className="w-12 h-12 text-gray-500 dark:text-gray-300 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Drag & drop or click to upload
          </p>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
