"use client";

import React, { useCallback, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/blocknoteStyles.css";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { uploadImage } from "@/utils/cloudinary";

interface EditorProps {
  onChange: (content: string) => void;
  initialContent?: string;
  className?: string;
  editable?: boolean;
}

function Editor({
  onChange,
  initialContent,
  className,
  editable = true,
}: EditorProps) {
  const { resolvedTheme } = useTheme();

  // Handle image upload via Cloudinary
  const handleUpload = useCallback(
    async (file: File) => {
      try {
        // Convert file to base64
        const reader = new FileReader();
        const fileData: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        // Upload to Cloudinary
        const { url } = await uploadImage(fileData);
        return url; // BlockNote expects the uploaded image URL
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload image.");
        throw error;
      }
    },
    []
  );

  const parsedInitial = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch {
      return undefined;
    }
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: parsedInitial,
    uploadFile: handleUpload, // Connect Cloudinary upload to BlockNote
  });

  const handleChange = useCallback(() => {
    if (!editable) return;
    try {
      const blocks = editor.document;
      onChange(JSON.stringify(blocks ?? [], null, 2));
    } catch (e) {
      console.error("Editor serialization error:", e);
    }
  }, [editor, onChange, editable]);

  if (!editor) return <div className={className}>Loading editor…</div>;

  return (
    <>
      <style jsx global>{`
        /* Reset Tailwind preflight conflicts */
        .bn-container *,
        .bn-container *::before,
        .bn-container *::after {
          box-sizing: border-box;
        }

        [data-floating-ui-portal] {
          pointer-events: none !important;
          z-index: 9999 !important;
        }

        [data-floating-ui-portal] > * {
          pointer-events: auto !important;
        }

        .bn-formatting-toolbar,
        [role="toolbar"] {
          pointer-events: auto !important;
          z-index: 9999 !important;
          user-select: none;
          -webkit-user-select: none;
        }

        .bn-formatting-toolbar * {
          pointer-events: auto !important;
        }

        .bn-formatting-toolbar button,
        .bn-formatting-toolbar [role="button"] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        .bn-formatting-toolbar {
          transition: none !important;
          animation: none !important;
        }

        .bn-container button {
          background-color: transparent;
          background-image: none;
          padding: 0;
          line-height: inherit;
          color: inherit;
        }

        .bn-container {
          position: relative;
          z-index: 1;
        }

        .bn-editor {
          position: relative;
          z-index: 1;
        }

        .bn-side-menu,
        .bn-drag-handle-menu,
        .bn-slash-menu,
        .bn-suggestion-menu {
          z-index: 9998 !important;
          pointer-events: auto !important;
        }

        .bn-container img {
          max-width: 100%;
          height: auto;
        }

        .bn-container svg {
          display: inline-block;
          vertical-align: middle;
        }

        .bn-container .bn-image-loading {
          opacity: 0.6;
        }

        .bn-container[data-readonly="true"] {
          cursor: default;
        }

        .bn-container[data-readonly="true"] .bn-side-menu,
        .bn-container[data-readonly="true"] .bn-drag-handle-menu {
          display: none !important;
        }
      `}</style>

      <div
        className={className ?? "w-full"}
        style={{ position: "relative" }}
        data-readonly={!editable}
      >
        <BlockNoteView
          editor={editor}
          editable={editable}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

export default Editor;
