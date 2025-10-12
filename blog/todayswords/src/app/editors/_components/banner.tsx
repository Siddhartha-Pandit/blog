"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "./modals/confirm-modal";

interface BannerProps {
  documentId: string;
}

export const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter();

  // 🧹 Permanently delete a document
  const onRemove = async () => {
    const promise = fetch("/api/blog/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: documentId }),
    });

    toast.promise(promise, {
      loading: "Deleting document...",
      success: "Document deleted successfully!",
      error: "Failed to delete document.",
    });

    try {
      const res = await promise;
      if (!res.ok) throw new Error("Failed to delete document");
      router.push("/documents");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔁 Restore an archived document
  const onRestore = async () => {
    const promise = fetch("/api/blog/restore", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: documentId }),
    });

    toast.promise(promise, {
      loading: "Restoring document...",
      success: "Document restored successfully!",
      error: "Failed to restore document.",
    });

    try {
      const res = await promise;
      if (!res.ok) throw new Error("Failed to restore document");
      router.push("/documents");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This page is in the Trash.</p>

      {/* Restore Button */}
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore page
      </Button>

      {/* Delete Forever Button */}
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};
