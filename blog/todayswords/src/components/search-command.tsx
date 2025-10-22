"use client";

import { useState, useEffect } from "react";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";

interface DocumentType {
  _id: string;
  title?: string;
  icon?: string;
}

export const SearchCommand = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  // ✅ Fetch documents from your backend API
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchDocuments = async () => {
      try {
        const res = await fetch(`/api/blog/get`, {
          credentials: "include", // send session cookies
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to fetch documents: ${res.status} ${errText}`);
        }

        const data: any[] = await res.json();

        // Flatten tree structure (since /api/blog/get returns nested docs)
        const flattenDocs = (docs: any[]): DocumentType[] =>
          docs.flatMap((doc) => [
            { _id: doc._id, title: doc.title, icon: doc.icon },
            ...flattenDocs(doc.children || []),
          ]);

        setDocuments(flattenDocs(data));
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };

    fetchDocuments();
  }, [session?.user?.id]);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  if (!isMounted || status === "loading") return null;

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput
        placeholder={`Search ${session?.user?.name || "your"} documents...`}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          {documents.map((document) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.title}`}
              onSelect={() => onSelect(document._id)}
            >
              {document.icon ? (
                <p className="mr-2 text-[18px]">{document.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              {document.title || "Untitled"}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
