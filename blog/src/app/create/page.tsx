// pages/create.tsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import Editor from "@/components/Editor";
import FooterCreate from "@/components/FooterCreate";
import BlogSettingsDrawer from "@/components/BlogSettingsDrawer";

// Ensure the editor component accepts an onChange prop and a forwarded ref.
const EditorWithOnChange = Editor as React.ComponentType<
  { onChange: (content: any) => void } & React.RefAttributes<any>
>;

const CreatePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const editorRef = useRef<any>(null);

  // Post metadata state
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Programming");
  const [tags, setTags] = useState<string[]>(["technology", "programming"]);
  const [metaDescription, setMetaDescription] = useState("");
  const [featureImage, setFeatureImage] = useState<File | null>(null);

  // UI state for drawer and auto-save indicator
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [lastSavedTime, setLastSavedTime] = useState("Not saved yet");

  // Redirect if not logged in
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }
  }, [session, status, router]);

  // Function to save draft to server.
  const saveDraft = useCallback(async () => {
    if (!editorRef.current || !session) return;
    const contentJSON = editorRef.current.getJSON();
    if (!contentJSON) return;

    // Build form data to include image/file if provided.
    const formData = new FormData();
    formData.append("title", title || "Untitled Draft");
    formData.append("content", JSON.stringify(contentJSON));
    formData.append("category", selectedCategory);
    formData.append("tags", JSON.stringify(tags));
    formData.append("metaDescription", metaDescription);
    // Optionally include a field to identify the author if your endpoint needs it.
    formData.append("authorId", session.user.id);
    if (featureImage) {
      formData.append("featureImage", featureImage);
    }

    try {
      await axios.post("/api/blog/draft", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn("Auto-save failed:", err.response?.data || err.message);
    }
  }, [title, selectedCategory, tags, metaDescription, featureImage, session]);

  // Called on every editor change
  const handleEditorChange = useCallback(
    (content: any) => {
      setEditorContent(content);
      // Auto-save on change
      saveDraft();
    },
    [saveDraft]
  );

  // Utility to extract plain text from the editor content for word count.
  const extractPlainText = useCallback((node: any): string => {
    if (!node) return "";
    let text = node.text ?? "";
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        text += " " + extractPlainText(child);
      }
    }
    return text;
  }, []);

  const countWords = useCallback(
    (content: any): number => {
      if (!content) return 0;
      const plain = extractPlainText(content);
      return plain
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
    },
    [extractPlainText]
  );

  return (
    <div className="h-screen flex flex-col bg-[#faf9f6] dark:bg-[#1e1e1e] text-[#1e1e1e] dark:text-[#faf9f6]">
      {/* Top Navigation */}
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

      {/* Blog Settings Drawer */}
      <BlogSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        initialTags={tags}
        onFileAccepted={(file: File) => setFeatureImage(file)}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        onSave={(newTags: string[]) => {
          setTags(newTags);
          saveDraft();
        }}
      />

      {/* Editor Section */}
      <div className="flex-1 mt-0 mb-6 px-5 pt-[calc(15vh)]">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border-b-2 border-transparent rounded-md text-4xl focus:outline-none focus:border-[#d1d1d1]"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />
        <div className="w-full overflow-y-auto rounded-md bg-white dark:bg-[#2e2e2e]">
          <EditorWithOnChange ref={editorRef} onChange={handleEditorChange} />
        </div>
      </div>

      {/* Footer with Word Count and Last Save Time */}
      <FooterCreate
        wordCount={countWords(editorContent)}
        lastSaved={lastSavedTime}
      />
    </div>
  );
};

export default CreatePage;
