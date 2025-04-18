"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import AutoSizeInput from "@/components/AutoSizeInput";

interface Category {
  _id: string;
  name: string;
}

interface BlogSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  initialTags?: string[];
  onFileAccepted: (file: File) => void;
  metaDescription: string;
  setMetaDescription: (value: string) => void;
  onSaveTags: (tags: string[]) => void;
  saveDraft: () => void;
}

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  const portalRoot = document.getElementById("portal-root");
  return portalRoot ? createPortal(children, portalRoot) : <>{children}</>;
};

const BlogSettingsDrawer: React.FC<BlogSettingsDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  initialTags = [],
  onFileAccepted,
  metaDescription,
  setMetaDescription,
  onSaveTags,
  saveDraft,
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category/read");
        const result = await res.json();
        if (res.ok && result.data) {
          setCategories(result.data);
        } else {
          console.error("Failed to fetch categories", result);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    }
    fetchCategories();
  }, []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
    setIsAddingTag(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSettingsSave = () => {
    onSaveTags(tags);
    saveDraft();
    onClose();
  };

  const drawerContent = (
    <div
      id="drawer"
      className={`fixed top-[76px] bottom-0 right-0 w-[300px] shadow-2xl transition-transform duration-300 ease-in-out z-[100] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } bg-[#FAF9F6] text-[#1E1E1E] dark:bg-[#1e1e1e] dark:text-[#faf9f6] overflow-y-auto`}
    >
      <div className="flex items-center mt-3 relative">
        <span className="ml-3 text-2xl font-bold">Blog Setting</span>
        <button
          onClick={onClose}
          className="absolute right-3 rounded text-[#1e1e1e] dark:text-white"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col mt-5 px-3 pb-3">
        {/* Category Selector */}
        <div className="flex flex-col relative z-20">
          <label htmlFor="category" className="mb-2 text-base font-medium">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto h-8 pl-3 pr-2 text-xs font-medium bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 border border-[#d1d1d1] dark:border-[#525252] rounded-full appearance-none"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Section */}
        <div className="mt-5">
          <span className="mb-2 text-base font-medium">Tags</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center h-8 px-2 py-1 text-xs font-medium bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 border border-[#d1d1d1] dark:border-[#525252] rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(index)}
                  className="ml-1 inline-flex items-center px-1 py-1 text-xs font-medium cursor-pointer focus:outline-none hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <AutoSizeInput
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={handleAddTag}
                initialWidth={80}
              />
            ) : (
              <span
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center h-8 cursor-pointer border-dashed border border-[#d1d1d1] dark:border-[#525252] bg-transparent text-gray-800 dark:text-gray-100 px-2 py-1 rounded-full text-xs font-medium hover:bg-[#f0efec] dark:hover:bg-[#2a2a2a] transition-colors"
              >
                + Add tag
              </span>
            )}
          </div>
        </div>

        {/* Feature Image Section */}
        <div className="flex flex-col justify-center mt-5 gap-4">
          <span className="mb-2 text-base font-medium">Feature Image</span>
          <div className="flex flex-col ml-3">
            <ImageUpload onFileAccepted={onFileAccepted} />
          </div>
        </div>

        {/* Meta Description */}
        <div className="flex flex-col justify-center mt-5 gap-4">
          <span className="mb-2 text-base font-medium">Meta Description</span>
          <textarea
            rows={4}
            placeholder="Enter meta description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSettingsSave}
          className="cursor-pointer mt-2 bg-[#004EBA] text-[#faf9f6] hover:bg-[#005CEB] dark:bg-[#79ACF2] dark:text-[#1e1e1e] dark:hover:bg-[#88B9F7]"
        >
          Save Draft
        </Button>
      </div>
    </div>
  );

  return <Portal>{drawerContent}</Portal>;
};

export default BlogSettingsDrawer;