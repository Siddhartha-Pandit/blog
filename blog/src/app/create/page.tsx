"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PanelRightOpen, MessageCircle } from "lucide-react";
import Editor from "@/components/Editor";
import FooterCreate from "@/components/FooterCreate";
import BlogSettingsDrawer from "@/components/BlogSettingsDrawer";

const EditorWithOnChange = Editor as React.ComponentType<
  { onChange: (content: any) => void } & React.RefAttributes<any>
>;

const CreatePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Programming");
  const [tags, setTags] = useState<string[]>(["technology", "programming"]);
  const [metaDescription, setMetaDescription] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [lastSavedTime, setLastSavedTime] = useState("Not saved yet");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!session && status !== "loading") router.push("/");
  }, [session, status, router]);

  // Save draft to server
  const saveDraft = useCallback(async () => {
    if (!editorRef.current || !session?.accessToken) return;
    const contentJSON = editorRef.current.getJSON();
    if (!contentJSON) return;

    try {
      await axios.post(
        "/api/blog/draft",
        {
          title: title || "Untitled Draft",
          content: JSON.stringify(contentJSON),
          category: selectedCategory,
          tags,
          metaDescription,
          authorId: session.user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn("Auto-save failed:", err.response?.data || err.message);
    }
  }, [title, selectedCategory, tags, metaDescription, session]);

  // Debounced auto-save on editor content change
  const handleEditorChange = useCallback(
    (content: any) => {
      setEditorContent(content);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        saveDraft();
      }, 5000);
    },
    [saveDraft]
  );

  // Word count calculation
  const countWords = useCallback((text: any): number => {
    if (!text) return 0;
    const str = typeof text === "string" ? text : JSON.stringify(text);
    return str.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#faf9f6] dark:bg-[#1e1e1e] text-[#1e1e1e] dark:text-[#faf9f6]">
      {/* Top navigation bar */}
      <div className="fixed top-10 left-0 right-0 h-12 bg-[#faf9f6] dark:bg-[#1e1e1e] border-b border-[#d1d1d1] dark:border-[#525252] z-30 flex items-center justify-end space-x-2">
        <button className="px-4 py-2 text-sm flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="hidden md:inline">Message</span>
        </button>
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="px-4 py-2 text-sm flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isDrawerOpen ? "Close Drawer" : "Open Drawer"}
        </button>
      </div>

      {/* Settings drawer */}
      <BlogSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        {...{ selectedCategory, setSelectedCategory, tags, setTags, metaDescription, setMetaDescription }}
        isAddingTag={false}
        inputValue=""
        onInputChange={() => {}}
        onTagKeyDown={() => {}}
        onTagBlur={() => {}}
        onAddTag={() => {}}
        removeTag={() => {}}
        onFileAccepted={() => {}}
        onSave={saveDraft}
      />

      {/* Main editor area */}
      <div className="flex-1 mt-0 mb-6 px-5 pt-[calc(15vh)]">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border-b-2 border-transparent rounded-md text-4xl focus:outline-none focus:border-[#d1d1d1]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="w-full overflow-y-auto rounded-md bg-white dark:bg-[#2e2e2e]">
          <EditorWithOnChange ref={editorRef} onChange={handleEditorChange} />
        </div>
      </div>

      {/* Footer with status */}
      <FooterCreate
        wordCount={countWords(editorContent)}
        lastSaved={lastSavedTime}
      />
    </div>
  );
};

export default CreatePage;
