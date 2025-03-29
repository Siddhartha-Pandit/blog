"use client";

import React, { useState, useEffect, useRef } from "react";
import { Undo2, Redo2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AutoSizeInputProps {
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  initialWidth?: number;
}

// AutoSizeInput for adding new tags
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
  const { data: session, status } = useSession();
  const [isSavedDraft, setIsSaveDraft] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Category dropdown
  const categories = ["Programming", "Design", "Marketing", "Lifestyle", "Tech"];
  const measureRef = useRef<HTMLSpanElement>(null);
  const [selectWidth, setSelectWidth] = useState(60);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Recalculate select width when the selected category changes
  useEffect(() => {
    if (measureRef.current) {
      const measuredWidth = measureRef.current.offsetWidth + 35;
      setSelectWidth(measuredWidth);
    }
  }, [selectedCategory]);

  // Tags
  const [tags, setTags] = useState(["technology", "programming", "web dev"]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const tagContainerRef = useRef<HTMLDivElement>(null);

  // Hide inline tag input if user clicks outside while it's empty
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

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative mt-[50px] mx-4 sm:mx-8 lg:mx-20">
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
              {session?.user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer hover:underline" role="button">
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
          <div className="flex absolute top-4 right-3 space-x-2">
            <Button className="w-7 h-7 flex items-center justify-center bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white shadow-md rounded-full transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-700">
              <Undo2 />
            </Button>
            <Button className="w-7 h-7 flex items-center justify-center bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white shadow-md rounded-full transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-700">
              <Redo2 />
            </Button>
          </div>
        </div>
      </div>

      {/* Category & Tags Section */}
      <div ref={tagContainerRef} className="flex flex-col sm:flex-row justify-between p-5">
        {/* Category Dropdown (improved dark theme) */}
        <div className="flex items-center mb-4 sm:mb-0 sm:mr-4">
          <div
            className="
              inline-flex items-center px-3 py-1 text-sm font-medium
              bg-[#faf9f6] dark:bg-[#1e1e1e]
              text-gray-800 dark:text-gray-100
              border border-[#d1d1d1] dark:border-[#525252]
              rounded-full relative mb-2
            "
          >
            {/* Hidden measure span to calculate width */}
            <span ref={measureRef} className="invisible absolute whitespace-pre">
              {selectedCategory}
            </span>

            <select
              onMouseDown={() => setIsDropdownOpen(true)}
              onBlur={() => setIsDropdownOpen(false)}
              style={{ width: selectWidth, transition: "width 0.25s ease" }}
              className="
                appearance-none bg-transparent outline-none pr-8
                text-gray-800 dark:text-gray-100
              "
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="
                    bg-[#faf9f6] dark:bg-[#1e1e1e]
                    text-[#1e1e1e] dark:text-[#faf9f6]
                  "
                >
                  {cat}
                </option>
              ))}
            </select>

            {/* Chevron icon that toggles up/down */}
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
              {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </div>

        {/* Tags Input Section */}
        <div className="flex flex-col w-full">
          <div className="flex flex-wrap gap-2 justify-start">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="
                  inline-flex items-center
                  px-3 py-1 text-sm font-medium
                  bg-[#faf9f6] dark:bg-[#1e1e1e]
                  text-gray-800 dark:text-gray-100
                  border border-[#d1d1d1] dark:border-[#525252]
                  rounded-full
                "
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
                initialWidth={100}
              />
            ) : (
              <span
                onClick={() => setIsAddingTag(true)}
                className="
                  inline-flex items-center cursor-pointer
                  border-dashed border border-[#d1d1d1] dark:border-[#525252]
                  bg-transparent text-[#1e1e1e] dark:text-[#faf9f6]
                  px-3 py-1 rounded-full text-sm
                  hover:bg-[#f0efec] dark:hover:bg-[#2a2a2a]
                  transition-colors
                "
              >
                + Add tag
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 px-5">
        <h1 className="text-2xl font-bold">Create</h1>
      </div>

      {/* CMS Editor Components */}
      <div className="px-5">
        <p>Your CMS editor components go here...</p>
      </div>
    </div>
  );
};

export default CreatePage;
