"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import Editor from "@/components/Editor";
import BlogSettingsDrawer from "@/components/BlogSettingsDrawer";

// Ensure the editor component accepts an onChange prop and a forwarded ref.
const EditorWithOnChange = Editor as React.ComponentType<
  { onChange: (content: any) => void } & React.RefAttributes<any>
>;

const CreatePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Post metadata state
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState("");
  const [featureImage, setFeatureImage] = useState<File | null>(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Editor content state
  const [editorContent, setEditorContent] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  // Save draft handler
  const handleSave = async () => {
    if (!session) return;

    const formData = new FormData();
    formData.append("title", title || "Untitled Draft");
    formData.append("content", JSON.stringify(editorContent));
    if (selectedCategory) {
      formData.append("category", selectedCategory);
    }
    formData.append("tags", JSON.stringify(tags));
    formData.append("metaDescription", metaDescription);
    if (featureImage) {
      formData.append("featureImage", featureImage);
    }

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
        onFileAccepted={(file: File) => setFeatureImage(file)}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        onSaveTags={(newTags: string[]) => setTags(newTags)}
        saveDraft={handleSave}
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
          <EditorWithOnChange ref={null} onChange={handleEditorChange} />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;