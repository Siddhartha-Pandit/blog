"use client";

import React, { useState, useEffect, useRef } from "react";
import { Save, Bold, Italic, Underline, Strikethrough, ListOrdered, List, Link2, Unlink } from "lucide-react";

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track text selection changes
  const handleTextSelection = () => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      });
    }
  };

  // Wrap selected text with Markdown syntax
  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;

    const { start, end } = selection;
    const text = markdown;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selected}${suffix}${after}`;
    setMarkdown(newText);

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        );
      }
    }, 0);
  };

  // Handle block formatting
  const formatBlock = (prefix: string) => {
    if (!textareaRef.current) return;

    const { start, end } = selection;
    const text = markdown;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const lineText = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);

    const newLineText = `${prefix} ${lineText.trim()}`;
    const newText = text.substring(0, lineStart) + newLineText + text.substring(lineEnd);

    setMarkdown(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = lineStart + prefix.length + 1;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Handle list formatting
  const handleList = (prefix: '- ' | '1. ') => {
    if (!textareaRef.current) return;

    const { start, end } = selection;
    const text = markdown;
    const selectedText = text.substring(start, end);
    
    // Split into lines and add prefix
    const formatted = selectedText.split('\n')
      .map(line => line.trim() ? `${prefix}${line}` : line)
      .join('\n');

    const newText = text.substring(0, start) + formatted + text.substring(end);
    setMarkdown(newText);
  };

  // Handle link insertion
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      wrapSelection('[', `](${url})`);
    }
  };

  // Handle save functionality
  const handleSave = () => {
    console.log("Saving markdown:", markdown);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="container">
        <div className="toolbar" style={{
          marginBottom: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px"
        }}>
          <button onClick={handleSave} title="Save">
            <Save size={16} />
          </button>

          <button onClick={() => wrapSelection('**')} title="Bold">
            <Bold size={16} />
          </button>

          <button onClick={() => wrapSelection('*')} title="Italic">
            <Italic size={16} />
          </button>

          <button onClick={() => wrapSelection('~~')} title="Strikethrough">
            <Strikethrough size={16} />
          </button>

          <button onClick={() => wrapSelection('<u>', '</u>')} title="Underline">
            <Underline size={16} />
          </button>

          <button onClick={() => handleList('1. ')} title="Ordered List">
            <ListOrdered size={16} />
          </button>

          <button onClick={() => handleList('- ')} title="Unordered List">
            <List size={16} />
          </button>

          <button onClick={insertLink} title="Insert Link">
            <Link2 size={16} />
          </button>

          <select 
            onChange={(e) => formatBlock('#'.repeat(parseInt(e.target.value)))}
            style={{ marginLeft: '10px' }}
          >
            <option value="">Heading</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
            <option value="5">H5</option>
            <option value="6">H6</option>
          </select>
        </div>

        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          onSelect={handleTextSelection}
          style={{
            width: "100%",
            height: "500px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "1.6"
          }}
          placeholder="Enter your markdown here..."
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;