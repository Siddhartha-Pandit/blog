// app/(main)/_components/editor.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/style.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/blocknoteStyles.css";

import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";

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
  editable = true 
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  // Handle image upload via EdgeStore
  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const response = await edgestore.publicFiles.upload({
          file,
        });
        return response.url;
      } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
      }
    },
    [edgestore]
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
    uploadFile: handleUpload, // Connect EdgeStore upload to BlockNote
  });

  const handleChange = useCallback(() => {
    if (!editable) return; // Don't trigger onChange if not editable
    
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

        /* Fix toolbar flickering - critical fixes */
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

        /* Prevent toolbar from closing on hover */
        .bn-formatting-toolbar * {
          pointer-events: auto !important;
        }

        /* Fix button interactions */
        .bn-formatting-toolbar button,
        .bn-formatting-toolbar [role="button"] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        /* Smooth appearance */
        .bn-formatting-toolbar {
          transition: none !important;
          animation: none !important;
        }

        /* Fix Tailwind's button reset conflicts */
        .bn-container button {
          background-color: transparent;
          background-image: none;
          padding: 0;
          line-height: inherit;
          color: inherit;
        }

        /* Ensure proper stacking */
        .bn-container {
          position: relative;
          z-index: 1;
        }

        .bn-editor {
          position: relative;
          z-index: 1;
        }

        /* Fix all BlockNote menus */
        .bn-side-menu,
        .bn-drag-handle-menu,
        .bn-slash-menu,
        .bn-suggestion-menu {
          z-index: 9998 !important;
          pointer-events: auto !important;
        }

        /* Prevent Tailwind from breaking BlockNote styles */
        .bn-container img {
          max-width: 100%;
          height: auto;
        }

        .bn-container svg {
          display: inline-block;
          vertical-align: middle;
        }

        /* Fix image upload progress indicators */
        .bn-container .bn-image-loading {
          opacity: 0.6;
        }

        /* Styling for read-only mode */
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