"use client";

import React, { useState, useEffect, useRef } from "react";
import { Save, ArrowUpToLine, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// AutoSizeInput Component: It measures text width using a hidden span and adjusts the input width accordingly.
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

  // Update width when the value changes
  useEffect(() => {
    if (spanRef.current) {
      // Extra 20px for padding
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
        className="
          inline-block 
          bg-[#faf9f6] dark:bg-[#1e1e1e] 
          text-[#1e1e1e] dark:text-[#faf9f6] 
          placeholder-gray-500 dark:placeholder-gray-400 
          px-3 py-1 text-sm font-medium
          outline-none border border-[#d1d1d1] dark:border-[#525252]
          rounded-full transition-colors
        "
      />
      {/* Hidden span to measure text width */}
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
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedDraft, setIsSaveDraft] = useState(false);
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Tag state
  const [tags, setTags] = useState(["technology", "programming", "web dev"]);
  // Controls if we are currently adding a new tag
  const [isAddingTag, setIsAddingTag] = useState(false);
  // The text for the new tag
  const [inputValue, setInputValue] = useState("");
  // Ref to focus the input when toggling isAddingTag (if needed)
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add a new tag on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setTags((prevTags) => [...prevTags, inputValue.trim()]);
      setInputValue("");
      setIsAddingTag(false);
    }
  };

  // Remove a tag by index
  const removeTag = (index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  // Optionally focus the input (if using inputRef inside AutoSizeInput, not required here)
  useEffect(() => {
    if (isAddingTag && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTag]);

  return (
    <>
      {status === "loading" ? (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      ) : (
        <div className="relative mt-[50px] mx-4 sm:mx-8 lg:mx-20 items-center">
          {/* Header Section */}
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-4">
              <Avatar className="w-9 h-9 border-0 !border-none !shadow-none !ring-0">
                {session?.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    loading="lazy"
                  />
                ) : (
                  <AvatarFallback className="bg-gray-500 text-white">
                    {session?.user?.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-customLight dark:text-customDark font-semibold">
                  {session?.user.name || "Guest"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <Popover>
                    <PopoverTrigger asChild>
                      <span
                        className="cursor-pointer hover:underline"
                        role="button"
                      >
                        {new Date(date || new Date()).toLocaleDateString("en-GB")}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] bg-[#faf9f6] dark:bg-[#1e1e1e] p-2 shadow-lg rounded-md border border-gray-300 dark:border-gray-700">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="border-none text-xs w-full bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                  <span> • </span>
                  {isSavedDraft ? (
                    "Saved"
                  ) : (
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => setIsSaveDraft(true)}
                    >
                      Save Draft
                    </span>
                  )}
                </p>
              </div>
              <div className="flex absolute top-4 right-3 justify-end space-x-2">
                <Button className="w-7 h-7 flex items-center justify-center bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white shadow-md rounded-full transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-lg">
                  <Undo2 />
                </Button>
                <Button className="w-7 h-7 flex items-center justify-center bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white shadow-md rounded-full transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-lg">
                  <Redo2 />
                </Button>
              </div>
            </div>
          </div>

          {/* Tags Input Section */}
          <div className="flex flex-col justify-between p-5">
            <div className="w-full mt-4">
              <div className="flex flex-wrap gap-2 justify-start">
                {/* Existing Tags */}
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 border border-[#d1d1d1] dark:border-[#525252] rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(index)}
                      className="cursor-pointer ml-2 focus:outline-none hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}

                {/* + Add Tag Pill or Inline AutoSizeInput */}
                {isAddingTag ? (
                  <AutoSizeInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      setInputValue("");
                      setIsAddingTag(false);
                    }}
                    initialWidth={100}
                  />
                ) : (
                  <span
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center cursor-pointer border-dashed border border-[#d1d1d1] dark:border-[#525252] bg-transparent text-[#1e1e1e] dark:text-[#faf9f6] px-3 py-1 rounded-full text-sm hover:bg-[#f0efec] dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    + Add tag
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Create</h1>
          </div>

          {/* CMS Editor Components */}
          <div>
            <p>Your CMS editor components go here...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePage;
