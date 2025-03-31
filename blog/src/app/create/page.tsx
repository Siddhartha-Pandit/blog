"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pen,
  Undo2,
  Redo2,
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
  PanelRightOpen,
  MessageCircle,
  PanelRightClose
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ImageUpload";

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
      <span ref={spanRef} className="invisible absolute whitespace-pre text-sm font-medium px-3 py-1">
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
      router.push("/");
    }
  }, [session, router]);

  const [isSavedDraft, setIsSavedDraft] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Category dropdown state
  const categories = ["Programming", "Design", "Marketing", "Lifestyle", "Tech"];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [isOpen, setIsOpen] = useState(false);

  // Tags state
  const [tags, setTags] = useState(["technology", "programming", "web dev"]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [words, setWords] = useState(0)
  const [savedTime, setSavedTime] = useState("Just Now")
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
  const tabs = [
    {
      icon: <Bold className="w-4 h-4" />,
      label: "Text Format",
      content: (
        <div className="flex items-center space-x-3 w-full  rounded">
          <Toggle><span><Bold /></span></Toggle>
          <Toggle><span><Italic /></span></Toggle>
          <Toggle><span><Underline /></span></Toggle>
          <ToggleGroup type="single">
            <ToggleGroupItem value="UL"><span><List /></span></ToggleGroupItem>
            <ToggleGroupItem value="OL"><span><ListOrdered /></span></ToggleGroupItem>
            <ToggleGroupItem value="DL"><span><ListTree /></span></ToggleGroupItem>
            <ToggleGroupItem value="SL"><span><ListChecks /></span></ToggleGroupItem>
          </ToggleGroup>
        </div>
      ),
    },
    {
      icon: <Pen className="w-4 h-4" />,
      label: "Text Design",
      content: (
        <div className="flex items-center space-x-3 w-full  rounded">
          <Toggle><span><Link /></span></Toggle>
          <Toggle><span><Regex /></span></Toggle>
          <Toggle><span><Highlighter /></span></Toggle>
          <Toggle><span><Strikethrough /></span></Toggle>
          <Toggle><span><Superscript /></span></Toggle>
          <Toggle><span><Subscript /></span></Toggle>
        </div>
      ),
    },
    {
      icon: <Heading className="w-4 h-4" />,
      label: "Heading",
      content: (
        <div className="flex items-center space-x-3 w-full  rounded">
          <ToggleGroup type="single">
            <ToggleGroupItem value="H1"><Heading1 /></ToggleGroupItem>
            <ToggleGroupItem value="H2"><Heading2 /></ToggleGroupItem>
            <ToggleGroupItem value="H3"><Heading3 /></ToggleGroupItem>
            <ToggleGroupItem value="H4"><Heading4 /></ToggleGroupItem>
            <ToggleGroupItem value="H5"><Heading5 /></ToggleGroupItem>
            <ToggleGroupItem value="H6"><Heading6 /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      ),
    },
    {
      icon: <Plus className="w-4 h-4" />,
      label: "Insert",
      content: (
        <div className="flex items-center space-x-3 w-full  rounded">
          <Toggle><span><Quote /></span></Toggle>
          <Toggle><span><ImageIcon aria-label="Image icon" /></span></Toggle>
          <Toggle><span><VideoIcon aria-label="Video icon" /></span></Toggle>
          <Toggle><span><Code /></span></Toggle>
          <Toggle><span><Grid3x3 /></span></Toggle>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="relative mt-12 mx-4 sm:mx-8 lg:mx-20">
        {/* Drawer */}
        <div
          id="drawer"
          className={`fixed top-0 right-0 w-[300px] h-full shadow-2xl transform transition-transform duration-300 ease-in-out mt-12.5 z-100 ${isOpen ? "right-0" : "right-[-300px]"
            } bg-[#FAF9F6] text-[#1E1E1E] dark:bg-[#1e1e1e] dark:text-[#faf9f6] overflow-y-auto max-h-[calc(100vh-3rem)]`}
        >
          <div className="flex items-center mt-3 relative">
            <span className="ml-3 text-2xl font-bold">Blog Setting</span>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-3  rounded text-[#1e1e1e] dark:text-white"
            >
              <PanelRightClose />
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
              <div className="flex flex-col justify-center items-center mt-5 gap-4">
                <span className="mb-2 text-base font-medium">Feature Image</span>
                <div className="flex flex-col ml-3">
                  <ImageUpload onFileAccepted={handleFileAccepted} />
                </div>
              </div>

              {/* Meta Description */}
              <div className="flex flex-col justify-center items-center mt-5 gap-4">
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

        {/* Fixed Tabs Header */}
        <div className="fixed top-10 left-0 right-0 h-12 bg-[#faf9f6] dark:bg-[#1e1e1e] border-b border-[#d1d1d1] dark:border-[#525252] z-20 flex items-center justify-evenly space-x-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-2 py-2 text-sm flex items-center justify-center transition-colors ${activeTab === index
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
          <button
            className="px-4 py-2 text-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="mr-1"><MessageCircle /></span>
            <span className="hidden md:inline">Message</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 text-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isOpen ? <span className="mr-1"><PanelRightOpen /></span> : <span className="mr-1"><PanelRightClose /></span>}
            <span className="hidden md:inline">{isOpen ? "Close " : "Open "}Drawer</span>
          </button>
        </div>


        {/* Fixed Tabs Content */}
        <div className="fixed top-20 left-0 right-0 h-[50px] bg-[#eae9e6] dark:bg-[#2e2e2e] z-10 overflow-hidden p-3">
          {tabs[activeTab].content}
        </div>


        {/* Title Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 mt-35 px-5">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 border-b-2 border-transparent rounded-md text-4xl focus:outline-none focus:border-[#d1d1d1] dark:focus:border-[#525252]"
          />
        </div>

        {/* Header Section */}
        {/* <div className="flex flex-row items-center justify-between p-5">
          
          <div className="flex space-x-2">
            <Button className="w-7 h-7 flex items-center justify-center bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white shadow rounded-full transition-colors hover:bg-gray-300 dark:hover:bg-gray-700">
              <Undo2 />
            </Button>
            <Button className="w-7 h-7 flex items-center justify-center bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white shadow rounded-full transition-colors hover:bg-gray-300 dark:hover:bg-gray-700">
              <Redo2 />
            </Button>
          </div>
        </div> */}

        {/* CMS Editor Components */}
        <div className="flex items-center w-full sm:w-auto">
          <div className="min-h-60 m-3 p-4 w-full bg-[#eae9e6] text-[#1e1e1e] shadow-lg shadow-gray-200/40 hover:shadow-xl hover:shadow-gray-300/40 dark:bg-[#2e2e2e] dark:text-[#faf9f6] dark:border-[#525252] dark:shadow-gray-900/50 transition-all duration-300 transform hover:-translate-y-0.5">
            {/* Toolbar Container */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <Separator orientation="vertical" className="hidden sm:block" />
            </div>
            {/* Content Input */}
            <input
              type="text"
              placeholder="Tell your story..."
              className="w-full p-2 mt-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>
        {/* footer components */}


      </div>
      <div className="flex flex-row absolute bottom-0 w-full h-7 bg-gray-800 text-white items-center justify-around px-4 text-xs">
        <span>Last Saved: {" " + savedTime}</span>

        <div className="flex flex-row items-center space-x-1">
          <span className="text-xs text-gray-800 dark:text-gray-200">Authors:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="w-4 h-4 border-0 !shadow-none">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-200">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs text-gray-800 dark:text-gray-200">
                  {session?.user?.name || "Guest"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-row absolute bottom-0 w-full h-7 bg-gray-800 text-white items-center justify-around px-4 text-xs">
        <span>Last Saved: {" " + savedTime}</span>

        <div className="flex flex-row items-center space-x-1">
          <span className="text-xs text-gray-200">Authors:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="w-4 h-4 border-0 !shadow-none">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-200">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent className="bg-[#e6e9ea] dark:bg-[#2e2e2e]">
                <p className="text-xs text-[#1e1e1e]  dark:text-[#f6f9fa]">
                  {session?.user?.name || "Guest"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-row items-center justify-between gap-x-4">
          <span className="text-xs text-gray-200">Contributors:</span>
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger >
                <Avatar className="w-4 h-4 border-0 !shadow-none">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-200">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent className="bg-[#e6e9ea] dark:bg-[#2e2e2e]">
                <p className="text-xs text-[#1e1e1e]  dark:text-[#f6f9fa]">
                  {session?.user?.name || "Guest"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <span>{words} words</span>
      </div>


    </>
  );
};

export default CreatePage;
