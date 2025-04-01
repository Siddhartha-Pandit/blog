"use client";
import React, { useState, useRef, useEffect } from "react";

const ContentEditor = () => {
  const [content, setContent] = useState("<div></div>");
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
    console.log(newContent);
  };

  return (
    <div
      contentEditable
      suppressContentEditableWarning={true}
      onInput={handleInput}
      ref={editorRef}
      dir="ltr"
      className="w-full min-h-[150px] p-4 bg-white dark:bg-[#2e2e2e] text-[#1e1e1e] dark:text-[#faf9f6] focus:outline-none"
    />
  );
};

export default ContentEditor;