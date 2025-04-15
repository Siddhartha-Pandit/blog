"use client";

import React from "react";
import { createPortal } from "react-dom";
import { PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import AutoSizeInput from "@/components/AutoSizeInput";

interface BlogSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  tags: string[];
  isAddingTag: boolean;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagBlur: () => void;
  onAddTag: () => void;
  removeTag: (index: number) => void;
  onFileAccepted: (file: File) => void;
  metaDescription: string;
  setMetaDescription: (value: string) => void;
  onSave: () => void;
}

// Simple Portal implementation using ReactDOM.createPortal.
// Ensure that your public/index.html or _document.tsx (in Next.js) contains:
// <div id="portal-root"></div>
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof window === "undefined") return null;
  const portalRoot = document.getElementById("portal-root");
  return portalRoot ? createPortal(children, portalRoot) : <>{children}</>;
};

const BlogSettingsDrawer: React.FC<BlogSettingsDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  tags,
  isAddingTag,
  inputValue,
  onInputChange,
  onTagKeyDown,
  onTagBlur,
  onAddTag,
  removeTag,
  onFileAccepted,
  metaDescription,
  setMetaDescription,
  onSave,
}) => {
  return (
    <div
      id="drawer"
      className={`fixed top-0 right-0 w-[300px] h-[calc(100vh-76px)] shadow-2xl transition-all duration-300 ease-in-out z-[100] mt-12 ${
        isOpen ? "right-0" : "right-[-300px]"
      } bg-[#FAF9F6] text-[#1E1E1E] dark:bg-[#1e1e1e] dark:text-[#faf9f6] overflow-visible`}
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
            {["Programming", "Design", "Marketing", "Lifestyle", "Tech"].map(
              (cat) => (
                <option key={cat} value={cat} className="text-gray-800 dark:text-gray-100">
                  {cat}
                </option>
              )
            )}
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
                  onClick={() => removeTag(index)}
                  className="ml-1 inline-flex items-center h-8 px-1 py-1 text-xs font-medium cursor-pointer focus:outline-none hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <AutoSizeInput
                value={inputValue}
                onChange={onInputChange}
                onKeyDown={onTagKeyDown}
                onBlur={onTagBlur}
                initialWidth={80}
              />
            ) : (
              <span
                onClick={onAddTag}
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

        {/* Save button */}
        <Button
          onClick={onSave}
          className="cursor-pointer mt-2 bg-[#004EBA] text-[#faf9f6] hover:bg-[#005CEB] dark:bg-[#79ACF2] dark:text-[#1e1e1e] dark:hover:bg-[#88B9F7]"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default BlogSettingsDrawer;
