"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface MenuProps {
  documentId: string;
}

export const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onArchive = async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/blog/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId }),
      });
      if (!res.ok) throw new Error("Failed to delete document");

      toast.success("Note moved to trash!");
      router.refresh(); // refresh list after deletion
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Open menu">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" alignOffset={8} forceMount>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onArchive();
          }}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        >
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="text-xs text-muted-foreground p-2">
          {/* You can replace with real user info from your backend */}
          Last edited by: You
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Skeleton loader
Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};
