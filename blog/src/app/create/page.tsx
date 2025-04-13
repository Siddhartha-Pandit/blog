"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pen,
  PanelRightOpen,
  MessageCircle,
  PanelRightClose,
} from "lucide-react";
import {
  Bold,
  Italic,
  Underline,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListTree,
  ListChecks,
  Highlighter,
  Strikethrough,
  Superscript,
  Subscript,
  Quote,
  Image as ImageIcon,
  Video as VideoIcon,
  Code,
  Grid3x3,
  Link,
  Regex,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ImageUpload from "@/components/ImageUpload";
// import Editor from "@/components/Editor";
import FooterCreate from "@/components/FooterCreate";
import Editor from "@/components/Editor";
interface AutoSizeInputProps {
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  initialWidth?: number;
}

const AutoSizeInput: React.FC<AutoSizeInputProps> = ({
  value,
  placeholder = "New tag...",
  onChange,
  onKeyDown,
  onBlur,
  initialWidth = 100,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(initialWidth);
  useEffect(() => {
    if (spanRef.current) {
      setInputWidth(spanRef.current.offsetWidth + 20);
    }
  }, [value]);

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{ width: `${inputWidth}px` }}
        className="inline-block bg-[#faf9f6] dark:bg-[#1e1e1e] text-[#1e1e1e] dark:text-[#faf9f6] placeholder-gray-500 dark:placeholder-gray-400 px-3 py-1 text-sm font-medium outline-none border border-[#d1d1d1] dark:border-[#525252] rounded-full transition-colors"
      />
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre text-sm font-medium px-3 py-1"
      >
        {value || placeholder}
      </span>
    </>
  );
};

const CreatePage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if not authenticated.
  useEffect(() => {
    if (session === null) {
      // router.push("/");
    }
  }, [session, router]);

  // Category dropdown state
  const categories = ["Programming", "Design", "Marketing", "Lifestyle", "Tech"];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Tags state
  const [tags, setTags] = useState(["technology", "programming", "web dev"]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [, setUploadedFile] = useState<File | null>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState(0);
  
  const handleFileAccepted = (file: File) => {
    setUploadedFile(file);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isAddingTag &&
        inputValue.trim() === "" &&
        tagContainerRef.current &&
        !tagContainerRef.current.contains(e.target as Node)
      ) {
        setIsAddingTag(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddingTag, inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setTags((prevTags) => [...prevTags, inputValue.trim()]);
      setInputValue("");
      setIsAddingTag(false);
    }
  };

  const removeTag = (index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  if (session === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  // Define tabs with icons and labels.
  

  return (
    <div className="h-screen flex flex-col bg-[#faf9f6] dark:bg-[#1e1e1e] text-[#1e1e1e] dark:text-[#faf9f6]">
      {/* Drawer */}
      <div
        id="drawer"
        className={`fixed top-0  right-0 w-[300px] h-[calc(100vh-76px)] shadow-2xl transform transition-transform duration-300 ease-in-out z-100 mt-12  ${
          isOpen ? "right-0" : "right-[-300px]"
        } bg-[#FAF9F6] text-[#1E1E1E] dark:bg-[#1e1e1e] dark:text-[#faf9f6] overflow-y-auto`}
      >
        <div className="flex items-center mt-3 relative">
          <span className="ml-3 text-2xl font-bold">Blog Setting</span>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-3 rounded text-[#1e1e1e] dark:text-white"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col mt-5 px-3 pb-3">
          <div className="flex flex-col">
            <span className="mb-2 text-base font-medium">Category</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-auto h-8 inline-flex items-center pl-3 pr-2 text-xs font-medium bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 border border-[#d1d1d1] dark:border-[#525252] rounded-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#faf9f6] dark:bg-[#1e1e1e]">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-gray-800 dark:text-gray-100 text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tags Section */}
            <div ref={tagContainerRef} className="flex flex-col sm:flex-row justify-between items-start mt-5 gap-4">
              <div className="flex flex-col w-full">
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
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        if (inputValue.trim() !== "") {
                          setTags((prevTags) => [...prevTags, inputValue.trim()]);
                        }
                        setInputValue("");
                        setIsAddingTag(false);
                      }}
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
            </div>

            {/* Feature Image Section */}
            <div className="flex flex-col justify-center mt-5 gap-4">
              <span className="mb-2 text-base font-medium">Feature Image</span>
              <div className="flex flex-col ml-3">
                <ImageUpload onFileAccepted={handleFileAccepted} />
              </div>
            </div>

            {/* Meta Description */}
            <div className="flex flex-col justify-center mt-5 gap-4">
              <span className="mb-2 text-base font-medium">Meta Description</span>
              <textarea
                rows={4}
                placeholder="Enter meta description"
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="cursor-pointer mt-2 bg-[#004EBA] text-[#faf9f6] hover:bg-[#005CEB] dark:bg-[#79ACF2] dark:text-[#1e1e1e] dark:hover:bg-[#88B9F7]">
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed top-10 left-0 right-0 h-12 bg-[#faf9f6] dark:bg-[#1e1e1e] border-b border-[#d1d1d1] dark:border-[#525252] z-30 flex items-center justify-end space-x-2">
        <button className="px-4 py-2 text-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="mr-1">
            <MessageCircle className="w-4 h-4" />
          </span>
          <span className="hidden md:inline">Message</span>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 text-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isOpen ? (
            <span className="mr-1">
              <PanelRightOpen className="w-4 h-4" />
            </span>
          ) : (
            <span className="mr-1">
              <PanelRightClose className="w-4 h-4" />
            </span>
          )}
          <span className="hidden md:inline">{isOpen ? "Close" : "Open"} Drawer</span>
        </button>
      </div>
      <div className="flex-1 mt-0 mb-6 px-5 pt-[calc(15vh)]">
       
        <div className="w-full overflow-y-auto  rounded-md bg-white dark:bg-[#2e2e2e]">
          <Editor/>
        </div>
      </div>
      <FooterCreate/>
    </div>
  );
};

export default CreatePage;
