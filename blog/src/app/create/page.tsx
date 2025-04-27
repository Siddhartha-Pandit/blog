"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import BlogSettingsDrawer from "@/components/BlogSettingsDrawer";
import type { JSONContent } from '@tiptap/core';

const EditorWithOnChange = dynamic(
  () => import('@/components/Editor'),
  { ssr: false }
) as React.ComponentType<{
  onChange: (content: JSONContent) => void;
} & React.RefAttributes<any>>;

const CreatePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Post metadata state
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState("");
  const [featureImage, setFeatureImage] = useState<File | null>(null);

  // Publish settings state
  const [publishNow, setPublishNow] = useState<boolean>(false);
  const [publishDateTime, setPublishDateTime] = useState<string>("");

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Editor content state
  const [editorContent, setEditorContent] = useState<any>(null);
  const editorRef = useRef<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Save draft handler
  const handleSave = async () => {
    if (!session) return;

    const formData = new FormData();
    formData.append("title", title || "Untitled Draft");
    const content = editorContent
      ? JSON.stringify(editorContent)
      : JSON.stringify(editorRef.current?.getJSON() ?? {});
    formData.append("content", content);
    if (selectedCategory) {
      formData.append("category", selectedCategory);
    }
    formData.append("tags", JSON.stringify(tags));
    formData.append("metaDescription", metaDescription);
    if (featureImage) {
      formData.append("featureImage", featureImage);
    }

    // Append publish datetime
    const publishTime = publishNow
      ? new Date().toISOString()
      : publishDateTime
        ? new Date(publishDateTime).toISOString()
        : new Date().toISOString();
    formData.append("publishDateTime", publishTime);

    try {
      await axios.post(
        "/api/blog/draft",
        formData,
        { withCredentials: true }
      );
      // Optionally notify user of successful save
    } catch (err: any) {
      console.error("Save failed:", err);
    }
  };

  // Editor change handler
  const handleEditorChange = (content: any) => {
    setEditorContent(content);
  };

  // Title change handler
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Plain text extraction for word count
  const extractPlainText = (node: any): string => {
    if (!node) return "";
    let text = node.text ?? "";
    if (Array.isArray(node.content)) {
      node.content.forEach((child: any) => {
        text += " " + extractPlainText(child);
      });
    }
    return text;
  };

  const countWords = (content: any): number => {
    if (!content) return 0;
    const plain = extractPlainText(content);
    return plain
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf9f6] dark:bg-[#1e1e1e] text-[#1e1e1e] dark:text-[#faf9f6]">
      {/* Top Nav */}
      <div className="fixed top-10 left-0 right-0 h-12 bg-[#faf9f6] dark:bg-[#1e1e1e] border-b border-[#d1d1d1] dark:border-[#525252] z-30 flex items-center justify-end space-x-2">
        <button className="px-4 py-2 text-sm flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="hidden md:inline">Message</span>
        </button>
        <button
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          className="px-4 py-2 text-sm flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isDrawerOpen ? "Close Settings" : "Open Settings"}
        </button>
      </div>

      {/* Settings Drawer */}
      <BlogSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedCategory={selectedCategory || ""}
        setSelectedCategory={setSelectedCategory}
        initialTags={tags}
        onFileAccepted={(file: File| null) => setFeatureImage(file)}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        onSaveTags={(newTags: string[]) => setTags(newTags)}
        saveDraft={handleSave}
        publishNow={publishNow}
        setPublishNow={setPublishNow}
        publishDateTime={publishDateTime}
        setPublishDateTime={setPublishDateTime}
      />

      {/* Editor Section */}
      <div className="flex-1 mt-0 mb-6 px-5 pt-[calc(15vh)]">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border-b-2 border-transparent rounded-md text-4xl focus:outline-none focus:border-[#d1d1d1]"
          value={title}
          onChange={handleTitleChange}
        />
        <div className="w-full overflow-y-auto rounded-md bg-white dark:bg-[#2e2e2e]">
          <EditorWithOnChange
            ref={editorRef}
            onChange={handleEditorChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
