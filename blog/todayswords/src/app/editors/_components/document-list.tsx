"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileIcon } from "lucide-react";
import Item from "./item";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Document {
  _id: string;
  title: string;
  icon?: string | null;
  parentDocument?: string | null;
}

interface DocumentListProps {
  parentDocumentId?: string;
  level?: number;
}

const DocumentList = ({ parentDocumentId, level = 0 }: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Document[] | undefined>(undefined);

  // ✅ Fetch data from your backend API
  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        parentDocumentId
          ? `/api/blog/get?parentId=${parentDocumentId}` // ✅ correct API path
          : `/api/blog/get`, // ✅ correct API path
        {
          credentials: "include", // send cookies for session auth
        }
      );
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();

      // Ensure _id is string
      const normalizedData = data.map((doc: any) => ({
        ...doc,
        _id: String(doc._id),
      }));

      setDocuments(normalizedData);
    } catch (err) {
      console.error("Error loading documents:", err);
      toast.error("Failed to fetch documents");
      setDocuments([]); // fail gracefully
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [parentDocumentId]);

  const onExpand = (documentId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  };

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  if (documents.length === 0 && level > 0) {
    return (
      <p
        style={{ paddingLeft: `${level * 12 + 25}px` }}
        className="text-sm text-muted-foreground/70 italic"
      >
        No pages inside
      </p>
    );
  }

  return (
    <>
      {documents.map((document) => (
        <div key={document._id}>
          <Item
            id={document._id}
            onClick={() => onRedirect(document._id)}
            label={document.title || "Untitled"}
            icon={FileIcon}
            documentIcon={document.icon ?? undefined}
            active={params.documentId === document._id}
            level={level}
            onExpand={() => onExpand(document._id)}
            expanded={expanded[document._id]}
          />

          {expanded[document._id] && (
            <DocumentList
              parentDocumentId={document._id}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default DocumentList;
