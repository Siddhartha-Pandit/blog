"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";
import { Skeleton } from "@/components/ui/skeleton";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

// Updated Document type to include isPublished
interface Document {
  _id: string;
  title: string;
  icon?: string | null;
  isArchived?: boolean;
  isPublished: boolean; // <-- added this
  content?: string;
  // add other fields as needed
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchDocument = async () => {
    if (!params.documentId) {
      setDocument(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${params.documentId}`);
      if (!res.ok) throw new Error("Failed to fetch document");
      const data: Document = await res.json(); // ensure backend returns isPublished
      setDocument(data);
    } catch (err) {
      console.error(err);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [params.documentId]);

  if (loading || document === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1f1f1f] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (!document) return null;

  return (
    <>
      <nav className="bg-background dark:bg-[#1f1f1f] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Publish initialData={document} />
            <Menu documentId={document._id} />
          </div>
        </div>
      </nav>

      {document.isArchived && <Banner documentId={document._id} />}
    </>
  );
};
