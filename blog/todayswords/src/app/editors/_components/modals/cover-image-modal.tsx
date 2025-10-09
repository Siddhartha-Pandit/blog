"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { SingleImageDropzone } from "@/components/upload/single-image";
import { UploaderProvider, type UploadFn } from "@/components/upload/uploader-provider";
import { toast } from "sonner";

export const CoverImageModal = () => {
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();
  const update = useMutation(api.document.update);

  // next/navigation's useParams returns a record; cast to a helpful shape
  const params = useParams() as { documentId?: string | undefined };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = useCallback(() => {
    // ensure submit state is reset and modal closed
    setIsSubmitting(false);
    coverImage.onClose();
  }, [coverImage]);

  // uploadFn used by the UploaderProvider. The provider will call this when a file is provided.
  const uploadFn: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      if (!file) throw new Error("No file provided to upload.");

      setIsSubmitting(true);

      try {
        // Safely read the existing cover URL (may be undefined or null)
        const existingUrl = (coverImage as { url?: string | null }).url ?? undefined;

        // Convert explicit null -> undefined because EdgeStore likely expects undefined when absent
        const replaceTargetUrl = existingUrl === null ? undefined : existingUrl;

        // Call edgestore.publicFiles.upload with replaceTargetUrl so the backend replaces the file
        const res = await edgestore.publicFiles.upload({
          file,
          signal,
          onProgressChange,
          options: {
            // Only pass replaceTargetUrl if we have one; otherwise undefined is fine
            replaceTargetUrl,
          },
        });

        // Update the Convex document with new coverImage URL
        if (!params.documentId) {
          // defensive - ensure we have a documentId
          throw new Error("Missing documentId param.");
        }

        await update({
          id: params.documentId as Id<"documents">,
          coverImage: res.url,
        });

        toast.success("Cover image updated successfully!");
        // close modal and reset state
        onClose();
        return res; // UploaderProvider may want the result
      } catch (err) {
        console.error("[COVER_IMAGE_UPLOAD_ERROR]", err);
        toast.error("Failed to upload cover image.");
        setIsSubmitting(false);
        // rethrow so the provider can reflect error UI if it has one
        throw err;
      }
    },
    [edgestore, update, params.documentId, coverImage, onClose]
  );

  return (
    <Dialog
      open={coverImage.isOpen}
      // Keep a small handler so closing via backdrop/esc triggers our cleanup
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Upload a cover image</DialogTitle>
        </DialogHeader>

        <UploaderProvider uploadFn={uploadFn} autoUpload>
          <SingleImageDropzone className="w-full outline-none" disabled={isSubmitting} />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
};
