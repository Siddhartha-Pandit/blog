"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DocumentPage = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const onCreate = async () => {
    try {
      setIsCreating(true);
      toast.loading("Creating a new note...");

      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", content: "" }),
      });

      if (!res.ok) throw new Error("Failed to create note");

      const data = await res.json();

      // Use _id from backend
      const id = data._id as string;

      toast.success("New note created!");
      router.push(`/documents/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create a new note.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {/* Light Mode Image */}
      <Image
        src="/reading.jpeg"
        height={300}
        width={300}
        alt="Empty"
        className="dark:hidden"
      />
      {/* Dark Mode Image */}
      <Image
        src="/reading.jpeg"
        height={300}
        width={300}
        alt="Empty"
        className="hidden dark:block"
      />

      <h2 className="text-lg font-medium text-center">
        Welcome to <span className="font-semibold">Your Jotion Workspace</span>
      </h2>

      <Button onClick={onCreate} disabled={isCreating}>
        <PlusCircle className="h-4 w-4 mr-2" />
        {isCreating ? "Creating..." : "Create a note"}
      </Button>
    </div>
  );
};

export default DocumentPage;
