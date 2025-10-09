"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuProps {
  documentId: Id<"documents">;
}

export const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();
  const archive = useMutation(api.document.archive);

  const onArchive = () => {
    const promise = archive({ id: documentId });
    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash!",
      error: "Failed to archive note.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Open menu">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" alignOffset={8} forceMount>
        {/* single-line item: icon + text */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault(); // prevent form submits if any
            onArchive();
          }}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        >
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName ?? "—"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
Menu.SKeleton=function MenuSkeleton(){
    return(
        <Skeleton className="h-10 w-10"/>

  
    )
}