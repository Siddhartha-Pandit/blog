"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Toolbar } from "../../_components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentIdPageProps {
  params: {
    documentId: string;
  };
}

// Add _id to match Toolbar type
interface DocumentData {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const { documentId } = params;
  const [document, setDocument] = useState<DocumentData | null | undefined>(undefined);

  // ---------------------------
  // Simulate fetching document from localStorage
  // ---------------------------
  useEffect(() => {
    const storedDocs = JSON.parse(localStorage.getItem("documents") || "{}");
    const doc = storedDocs[documentId];
    setTimeout(() => {
      if (doc) {
        // map id -> _id
        setDocument({ _id: doc.id, ...doc });
      } else {
        setDocument(null);
      }
    }, 500); // simulate loading delay
  }, [documentId]);

  // ---------------------------
  // Dynamically import editor
  // ---------------------------
  const Editor = useMemo(
    () =>
      dynamic(() => import("@/components/editor"), {
        ssr: false,
        loading: () => (
          <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
            <div className="space-y-4 pl-8 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        ),
      }),
    []
  );

  // ---------------------------
  // Handle editor content change
  // ---------------------------
  const handleChange = (newContent: string) => {
    setDocument((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, content: newContent };

      // save back to localStorage
      const storedDocs = JSON.parse(localStorage.getItem("documents") || "{}");
      storedDocs[documentId] = { ...updated, id: updated._id }; // keep id for storage
      localStorage.setItem("documents", JSON.stringify(storedDocs));

      return updated;
    });
  };

  // ---------------------------
  // Loading Skeleton
  // ---------------------------
  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Document Not Found
  // ---------------------------
  if (document === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Document not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This document may not exist or has not been created yet.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Render Toolbar + Cover + Editor
  // ---------------------------
  return (
    <div className="pb-40">
      <Cover url={document.coverImage} fullBleed />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor onChange={handleChange} initialContent={document.content} />
      </div>
    </div>
  );
};

export default DocumentIdPage;
