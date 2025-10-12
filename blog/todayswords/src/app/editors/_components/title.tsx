"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Props
interface Document {
  _id: string;
  title?: string;
  icon?: string | null;
}

interface TitleProps {
  initialData: Document;
}

export const Title = ({ initialData }: TitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialData.title ?? "");

  // ✅ Update document title in real time (debounced)
  useEffect(() => {
    if (!isEditing) return;

    const handler = setTimeout(async () => {
      if (title !== initialData.title) {
        try {
          const res = await fetch("/api/documents/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: initialData._id, title: title || "Untitled" }),
          });
          if (!res.ok) throw new Error("Failed to update title");
        } catch (err) {
          console.error("Failed to update title:", err);
        }
      }
    }, 500); // 0.5s debounce delay

    return () => clearTimeout(handler);
  }, [title, isEditing, initialData._id, initialData.title]);

  // Keep local title in sync if it changes externally (like another tab)
  useEffect(() => {
    if (!isEditing) {
      setTitle(initialData.title ?? "");
    }
  }, [initialData.title, isEditing]);

  return (
    <div className="flex items-center gap-x-2">
      {!!initialData.icon && <p>{initialData.icon}</p>}

      {isEditing ? (
        <Input
          className="h-7 px-2 focus-visible:ring-transparent text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm hover:text-foreground transition-colors px-1 py-0.5 rounded-md hover:bg-accent"
        >
          <span className="truncate">{title || "Untitled"}</span>
        </button>
      )}
    </div>
  );
};

// 💀 Skeleton Loader
Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-4 w-16 rounded-md" />;
};
