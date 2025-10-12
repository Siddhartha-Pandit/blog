"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { uploadImage } from "@/utils/cloudinary";

// Single drag-and-drop dropzone
const Dropzone: React.FC<{ onUpload: (file: File) => void; disabled?: boolean }> = ({
  onUpload,
  disabled,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`w-full h-48 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
      }`}
    >
      <p className="text-sm text-muted-foreground">
        Drag & drop your cover image here, or click to select
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />
    </div>
  );
};

export const CoverImageModal = () => {
  const coverImage = useCoverImage();
  const params = useParams() as { documentId?: string };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = useCallback(() => {
    setIsSubmitting(false);
    coverImage.onClose();
  }, [coverImage]);

  const handleUpload = async (file: File) => {
    if (!params.documentId) return toast.error("Missing document ID");

    setIsSubmitting(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Upload to Cloudinary
      const url = await uploadImage(fileData);

      // Update the blog document
      const res = await fetch(`/api/blog/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.documentId, coverImage: url }),
      });

      if (!res.ok) throw new Error("Failed to update cover image");

      toast.success("Cover image updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload cover image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={coverImage.isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle className="text-center">Upload a Cover Image</DialogTitle>
        </DialogHeader>
        <Dropzone onUpload={handleUpload} disabled={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
};
