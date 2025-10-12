"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImageIcon, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { uploadImage, deleteImage } from "@/utils/cloudinary";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface CoverImageProps {
  url?: string | null;
  preview?: boolean;
  /** If true, cover will be full-bleed across the viewport (ignores parent's max-width) */
  fullBleed?: boolean;
}

export const Cover = ({ url, preview, fullBleed = false }: CoverImageProps) => {
  const coverImage = useCoverImage();
  const params = useParams() as { documentId?: string };
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(url ?? null);

  // Remove cover image
  const onRemove = async () => {
    if (!params.documentId || !currentUrl) return;
    setIsProcessing(true);

    try {
      // Delete from Cloudinary
      const publicId = currentUrl.split("/").pop()?.split(".")[0];
      if (publicId) await deleteImage(publicId);

      // Update backend
      const res = await fetch(`/api/blog/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.documentId, coverImage: null }),
      });

      if (!res.ok) throw new Error("Failed to remove cover image");

      setCurrentUrl(null);
      toast.success("Cover image removed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove cover image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Replace cover image
  const onReplace = async (file: File) => {
    if (!params.documentId) return;
    setIsProcessing(true);

    try {
      // Delete old cover if exists
      if (currentUrl) {
        const publicId = currentUrl.split("/").pop()?.split(".")[0];
        if (publicId) await deleteImage(publicId);
      }

      // Convert file to base64
      const reader = new FileReader();
      const fileData: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Upload new image to Cloudinary
      const { url: newUrl } = await uploadImage(fileData);

      // Update backend
      const res = await fetch(`/api/blog/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.documentId, coverImage: newUrl }),
      });

      if (!res.ok) throw new Error("Failed to update cover image");

      setCurrentUrl(newUrl);
      toast.success("Cover image updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to replace cover image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const wrapperClass = cn(
    "group overflow-hidden",
    fullBleed
      ? "relative left-1/2 right-1/2 w-screen -translate-x-1/2 h-[35vh]"
      : "relative w-full h-[35vh]",
    !currentUrl && "h-[12vh]",
    currentUrl && "bg-muted"
  );

  return (
    <div className={wrapperClass}>
      {currentUrl && (
        <Image
          src={currentUrl}
          fill
          alt="cover"
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      )}

      {currentUrl && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2 transition-opacity">
          <Button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files[0]) onReplace(e.target.files[0]);
              };
              input.click();
            }}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>

          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

// Skeleton fallback
Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};
