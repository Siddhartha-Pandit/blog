"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { Search, Undo, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "./modals/confirm-modal";
import { toast } from "sonner";

interface Document {
  _id: string;
  title?: string;
}

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();
  const [documents, setDocuments] = useState<Document[] | undefined>(undefined);
  const [search, setSearch] = useState("");

  // Fetch trashed documents from backend
  const fetchTrash = async () => {
    try {
      const res = await fetch("/api/documents/trash");
      if (!res.ok) throw new Error("Failed to fetch trash");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const filteredDocuments = documents?.filter((document) =>
    document.title?.toLowerCase().includes(search.toLowerCase())
  );

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const onRestore = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: string
  ) => {
    event.stopPropagation();
    try {
      const res = await fetch(`/api/documents/restore`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId }),
      });
      if (!res.ok) throw new Error("Failed to restore document");
      toast.success("Note restored!");
      fetchTrash();
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore note.");
    }
  };

  const onRemove = async (documentId: string) => {
    try {
      const res = await fetch(`/api/documents/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId }),
      });
      if (!res.ok) throw new Error("Failed to delete document");
      toast.success("Note deleted!");
      fetchTrash();
      if (params.documentId === documentId) {
        router.push("/documents");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note.");
    }
  };

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      {/* Search Bar */}
      <div className="flex items-center gap-x-2 p-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 bg-secondary focus-visible:ring-transparent"
          placeholder="Filter by page title..."
        />
      </div>

      {/* Document List */}
      <div className="mt-2 px-1 pb-1 space-y-1">
        {filteredDocuments?.length ? (
          filteredDocuments.map((document) => (
            <div
              key={document._id}
              role="button"
              onClick={() => onClick(document._id)}
              className="flex items-center justify-between p-2 rounded-sm hover:bg-primary/5 text-primary transition"
            >
              <span className="truncate pl-2">
                {document.title || "Untitled"}
              </span>
              <div className="flex items-center gap-x-1">
                {/* Restore Button */}
                <div
                  onClick={(e) => onRestore(e, document._id)}
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200"
                >
                  <Undo className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Confirm Delete Modal */}
                <ConfirmModal onConfirm={() => onRemove(document._id)}>
                  <div
                    role="button"
                    className="rounded-sm p-2 hover:bg-neutral-200"
                  >
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </div>
                </ConfirmModal>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-center text-muted-foreground py-2">
            No documents found.
          </p>
        )}
      </div>
    </div>
  );
};
