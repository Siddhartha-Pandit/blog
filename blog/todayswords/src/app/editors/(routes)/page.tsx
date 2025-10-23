"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

const DocumentPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);

  const onCreate = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to create a note.");
      return;
    }

    try {
      setIsCreating(true);
      toast.loading("Creating a new note...");
      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", content: "" }),
        
      });
            console.log("2. Creating the document")


      const text = await res.text(); // read text anyway to debug if error
      if (!res.ok) {
        console.error("Failed to create note:", res.status, text);
        toast.error(text || "Failed to create a new note.");
        return;
      }

      const data = JSON.parse(text);
      if (!data._id) throw new Error("No ID returned from backend");

      toast.success("New note created!");
      router.push(`/documents/${data._id}`);
    } catch (err) {
      console.error("Create note error:", err);
      toast.error("Failed to create a new note.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/reading.jpeg"
        height={300}
        width={300}
        alt="Empty"
        className="dark:hidden"
      />
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
