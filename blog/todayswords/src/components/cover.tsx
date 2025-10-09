"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImageIcon, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { Skeleton } from "./ui/skeleton";
interface CoverImageProps {
  url?: string | null;
  preview?: boolean;
  /** If true, cover will be full-bleed across the viewport (ignores parent's max-width) */
  fullBleed?: boolean;
}

export const Cover = ({ url, preview, fullBleed = false }: CoverImageProps) => {
  const { edgestore } = useEdgeStore();
  const coverImage = useCoverImage();
  const params = useParams();
  const removeCoverImage = useMutation(api.document.removeCoverImage);

  const onRemove = async () => {
    try {
      if (url) {
        await edgestore.publicFiles.delete({ url });
      }

      await removeCoverImage({
        id: params.documentId as Id<"documents">,
      });
    } catch (error) {
      console.error("Error removing cover image:", error);
    }
  };

  /**
   * Wrapper classes:
   * - base: relative + h for the height, w-full so it fills its direct container
   * - fullBleed: use a trick to make an element span the full viewport width while staying centered
   *             (relative left-1/2 w-screen -translate-x-1/2)
   */
  const wrapperClass = cn(
    "group overflow-hidden",
    fullBleed
      ? "relative left-1/2 right-1/2 w-screen -translate-x-1/2 h-[35vh]" // full viewport width
      : "relative w-full h-[35vh]", // constrained to parent width
    !url && "h-[12vh]",
    url && "bg-muted"
  );

  return (
    <div className={wrapperClass}>
      {!!url && (
        <Image
          src={url}
          fill
          alt="cover"
          className="object-cover object-center"
          // sizes + priority help the browser choose the correct resource,
          // especially for full-width images. Adjust sizes if you want a different breakpoint behavior.
          sizes="100vw"
          priority
        />
      )}

      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2 transition-opacity">
          <Button
            onClick={() => coverImage.onReplace && coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>

          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
Cover.Skeleton =function CoverSkeleton(){
    return(
        <Skeleton className="w-full h-[12vh]"/>
    )
}