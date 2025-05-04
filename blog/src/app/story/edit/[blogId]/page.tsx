"use client";

import React, { useState, useEffect, ChangeEvent, useRef, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import BlogSettingsDrawer from "@/components/BlogSettingsDrawer";
import type { JSONContent } from "@tiptap/core";

// Dynamically load the Tiptap editor (no SSR)
const EditorWithOnChange = dynamic(
  () => import("@/components/Editor"),
  { ssr: false }
) as React.ComponentType<{
  onChange: (content: JSONContent) => void;
  content?: JSONContent;
} & React.RefAttributes<any>>;

interface BlogData {
  _id: string;
  title: string;
  content: JSONContent | string;
  tags: string[];
  category?: string;
  featureImage: string;
  metaDescription: string;
  isPublished: boolean;
  publishDateTime: string | null;
}

export default function EditBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { blogId } = useParams() as { blogId: string };

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featureImageFile, setFeatureImageFile] = useState<File | null>(null);
  const [featureImageUrl, setFeatureImageUrl] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [publishDateTime, setPublishDateTime] = useState("");
  const [editorContent, setEditorContent] = useState<JSONContent>({ type: "doc", content: [] });
  const editorRef = useRef<any>(null);

  // Drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Redirect away if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch existing blog on mount
  useEffect(() => {
    if (!blogId) return;

    axios
      .get<{ data: BlogData }>(`/api/blog/read/${blogId}`)
      .then(({ data: { data } }) => {
        setTitle(data.title);
        setTags(data.tags);
        setSelectedCategory(data.category || "");
        setMetaDescription(data.metaDescription);
        setFeatureImageUrl(data.featureImage);
        const parsed = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
        setEditorContent(parsed);

        if (data.publishDateTime) {
          const isoSlice = new Date(data.publishDateTime).toISOString().slice(0, 16);
          setPublishDateTime(isoSlice);
          setPublishNow(new Date(data.publishDateTime) <= new Date());
        }
      })
      .catch(() => setError("Failed to load blog."))
      .finally(() => setLoading(false));
  }, [blogId]);

  // Only called when Update button is clicked
  const handleUpdate = async () => {
    if (!session) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append(
      "content",
      JSON.stringify(editorContent || editorRef.current?.getJSON() || {})
    );
    if (selectedCategory) formData.append("category", selectedCategory);
    formData.append("tags", JSON.stringify(tags));
    formData.append("metaDescription", metaDescription);

    if (featureImageFile) {
      formData.append("featureImage", featureImageFile);
    } else {
      formData.append("featureImageUrl", featureImageUrl);
    }

    formData.append("isPublished", publishNow ? "true" : "false");
    const iso = publishNow
      ? new Date().toISOString()
      : publishDateTime
      ? new Date(publishDateTime).toISOString()
      : "";
    formData.append("publishDateTime", iso);

    try {
      await axios.put(
        `/api/blog/mystory/update/${blogId}`,
        formData,
        { withCredentials: true }
      );
      // Only redirect on success
      router.push(`/blog/${blogId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf9f6] dark:bg-[#1e1e1e]">
      {/* Top navigation */}
      <div className="fixed top-10 left-0 right-0 h-12 bg-[#faf9f6] dark:bg-[#1e1e1e] border-b border-[#d1d1d1] dark:border-[#525252] z-30 flex items-center justify-end space-x-2 px-4">
        <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="hidden md:inline">Message</span>
        </button>
        <button
          onClick={() => setDrawerOpen(o => !o)}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
        >
          {drawerOpen ? "Close Settings" : "Open Settings"}
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Update
        </button>
      </div>

      {/* Settings drawer */}
      <BlogSettingsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        initialTags={tags}
        onFileAccepted={setFeatureImageFile}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        onSaveTags={setTags}
        saveDraft={() => {
          setPublishNow(false);
          setDrawerOpen(false);
        }}
        publishNow={publishNow}
        setPublishNow={setPublishNow}
        publishDateTime={publishDateTime}
        setPublishDateTime={setPublishDateTime}
        featureImageUrl={featureImageUrl}
      />

      {/* Editor section (no form wrapper) */}
      <div className="flex-1 flex flex-col pt-[15vh] px-6 overflow-auto">
        <input
          type="text"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-4xl font-bold p-2 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#d1d1d1]"
        />

        <div className="flex-1 mt-4 overflow-y-auto bg-white dark:bg-[#2e2e2e] rounded-md">
          <EditorWithOnChange
            ref={editorRef}
            onChange={setEditorContent}
            content={editorContent}
          />
        </div>
      </div>
    </div>
  );
}
