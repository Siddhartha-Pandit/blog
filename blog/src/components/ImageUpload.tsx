import React, { useState, useRef, useEffect } from "react";
import { ImageUp, Trash } from "lucide-react";
import Image from "next/image";
interface ImageUploadProps {
  onFileAccepted?: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileAccepted }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview URL when image changes.
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  // Validate that the file is an image.
  const isImageFile = (file: File) => file.type.startsWith("image/");

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && isImageFile(file)) {
      setImage(file);
      onFileAccepted?.(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isImageFile(file)) {
      setImage(file);
      onFileAccepted?.(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  // Trigger the hidden file input on click.
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Remove image function
  const removeImage = () => {
    setImage(null);
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-md p-4 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-400 border-gray-300 bg-gray-100 hover:border-gray-500 transition-all"
    >
      {preview ? (
        <div className="relative flex justify-center items-center">
          <Image
            src={preview}
            alt="Preview"
            style={{ height: "300px", width: "auto" }}
            className="rounded-md"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
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
