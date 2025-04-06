"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  ListOrdered,
  List,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Code2,
} from "lucide-react";
import TurndownService from "turndown";

const LANGUAGES = [
  "text",
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "go",
  "typescript",
  "html",
  "css",
  "sql",
  "swift",
  "kotlin",
  "rust",
];

const Editor = () => {
  const editorRef = useRef(null);
  const savedSelection = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState("text");
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef(null);

  // Floating toolbar formatting functions
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount) savedSelection.current = sel.getRangeAt(0);
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelection.current);
    }
  };

  const handleFormat = (cmd, val) => {
    saveSelection();
    document.execCommand(cmd, false, val);
    restoreSelection();
    editorRef.current?.focus();
    hideToolbar();
  };

  const toggleHeading = (tag) => {
    saveSelection();
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    const clean = current.replace(/[<>]/g, "");
    document.execCommand("formatBlock", false, clean === tag.toLowerCase() ? "p" : tag);
    restoreSelection();
    editorRef.current?.focus();
    hideToolbar();
  };

  const handleInsertHTML = (html) => {
    saveSelection();
    document.execCommand("insertHTML", false, html);
    restoreSelection();
    editorRef.current?.focus();
    hideToolbar();
  };

  // Code block helpers
  const isInCodeBlock = () => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return false;
    let node = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.classList.contains("code-block-container")
      ) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const getCodeBlockContainer = () => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.classList.contains("code-block-container")
      ) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  const insertCodeBlock = () => {
    const html = `
<div class="code-block-container my-4 border rounded overflow-hidden max-w-2xl">
  <div class="code-block-header flex justify-between items-center bg-gray-200 px-2 py-1 text-xs font-mono">
    <select class="code-lang-dropdown">
      ${LANGUAGES.map(
        (lang) =>
          `<option value="${lang}" ${lang === selectedLanguage ? "selected" : ""}>${lang}</option>`
      ).join("")}
    </select>
    <div class="flex space-x-2">
      <button class="copy-code-btn px-1 rounded bg-white hover:bg-gray-100">
        ${"<svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M0 0h24v24H0z' stroke='none'/><rect x='8' y='8' width='12' height='12' rx='2'/><path d='M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2'/></svg>"}
      </button>
      <button class="view-md-btn px-1 rounded bg-white hover:bg-gray-100">MD</button>
    </div>
  </div>
  <pre class="bg-gray-100 p-4 overflow-x-auto"><code class="language-${selectedLanguage}">\u200B</code></pre>
</div>`;
    handleInsertHTML(html);
  };

  const toggleCodeBlock = () => {
    const container = getCodeBlockContainer();
    if (container) {
      container.remove();
    } else {
      insertCodeBlock();
    }
  };

  // Blockquote helpers
  const getBlockquoteElement = () => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName === "BLOCKQUOTE"
      ) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  const toggleBlockquote = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    if (getBlockquoteElement()) {
      exitBlockquote();
      return;
    }
    const range = sel.getRangeAt(0);
    const blockquote = document.createElement("blockquote");
    const fragment = range.extractContents();
    blockquote.appendChild(fragment);
    range.insertNode(blockquote);
    const newRange = document.createRange();
    newRange.selectNodeContents(blockquote);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  };

  const exitBlockquote = () => {
    const blockquote = getBlockquoteElement();
    if (blockquote && editorRef.current) {
      const newParagraph = document.createElement("p");
      newParagraph.innerHTML = "<br>";
      blockquote.parentNode?.insertBefore(newParagraph, blockquote.nextSibling);
      const range = document.createRange();
      range.setStart(newParagraph, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  // Link helpers
  const getLinkElement = () => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "A") {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  const exitLink = () => {
    const linkEl = getLinkElement();
    if (linkEl && editorRef.current) {
      const parent = linkEl.parentNode;
      const offset = Array.from(parent.childNodes).indexOf(linkEl) + 1;
      const range = document.createRange();
      range.setStart(parent, offset);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const exitCodeBlock = () => {
    const container = getCodeBlockContainer();
    if (container && editorRef.current) {
      const newParagraph = document.createElement("p");
      newParagraph.innerHTML = "<br>";
      container.parentNode?.insertBefore(newParagraph, container.nextSibling);
      const range = document.createRange();
      range.setStart(newParagraph, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  // Exit formatting for any active element.
  const exitFormatting = () => {
    if (getCodeBlockContainer()) exitCodeBlock();
    else if (getLinkElement()) exitLink();
    else if (getBlockquoteElement()) exitBlockquote();
  };

  // ---------- Link insertion via floating toolbar ----------
  const handleInsertLink = () => {
    saveSelection();
    setLinkInputVisible(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  };

  const confirmInsertLink = () => {
    const sel = window.getSelection();
    let selectedText = sel.toString();
    if (!selectedText) selectedText = linkUrl;
    const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener" class="text-blue-600 underline">${selectedText}</a>`;
    handleInsertHTML(linkHTML);
    setLinkUrl("");
    setLinkInputVisible(false);
  };

  // ---------- Floating Toolbar State & Positioning ----------
  const showToolbar = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setToolbarVisible(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setToolbarPos({
      top: rect.top - 45 + window.scrollY,
      left: rect.left + rect.width / 2 - 100 + window.scrollX,
    });
    setToolbarVisible(true);
  };

  const hideToolbar = () => {
    setToolbarVisible(false);
    setLinkInputVisible(false);
  };

  // Listen for selection changes to update floating toolbar.
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && editorRef.current.contains(sel.anchorNode)) {
        showToolbar();
      } else {
        hideToolbar();
      }
    };
    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("keyup", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("keyup", handleSelectionChange);
    };
  }, []);

  // Keydown handler – pressing Enter inside blockquote exits formatting and adds a new line.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const keydownHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exitFormatting();
      } else if (e.key === "Enter") {
        if (getBlockquoteElement()) {
          e.preventDefault();
          exitBlockquote();
          document.execCommand("insertParagraph", false, null);
        }
      }
    };
    editor.addEventListener("keydown", keydownHandler);
    return () => editor.removeEventListener("keydown", keydownHandler);
  }, []);

  // Additional event listeners for code block buttons and language changes.
  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      if (target.matches(".copy-code-btn")) {
        const codeEl = target.closest(".code-block-container")?.querySelector("code");
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.textContent || "");
          target.textContent = "Copied!";
          setTimeout(() => (target.textContent = "Copy"), 2000);
        }
        e.stopPropagation();
      }
      if (target.matches(".view-md-btn")) {
        const codeEl = target.closest(".code-block-container")?.querySelector("code");
        if (codeEl) {
          const lang = codeEl.className.replace("language-", "");
          const text = codeEl.textContent || "";
          alert(`\`\`\`${lang}\n${text}\n\`\`\``);
        }
        e.stopPropagation();
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      if (target && target.classList.contains("code-lang-dropdown")) {
        const newLang = target.value;
        const container = target.closest(".code-block-container");
        if (container) {
          const codeEl = container.querySelector("pre code");
          if (codeEl) {
            codeEl.className = `language-${newLang}`;
          }
        }
      }
    };
    document.addEventListener("change", handler);
    return () => document.removeEventListener("change", handler);
  }, []);

  const viewAllMarkdown = () => {
    if (!editorRef.current) return;
    const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
    td.addRule("codeBlocks", {
      filter: (node) =>
        node.nodeName === "PRE" &&
        node.firstChild?.nodeName === "CODE" &&
        node.firstChild.className.startsWith("language-"),
      replacement: (_c, node) => {
        const codeNode = node.firstChild;
        const lang = codeNode.className.replace("language-", "");
        return `\`\`\`${lang}\n${codeNode.textContent}\n\`\`\`\n\n`;
      },
    });
    td.addRule("inlineCode", {
      filter: "code",
      replacement: (content, node) =>
        node.parentNode?.nodeName === "PRE" ? content : `\`${content}\``,
    });
    const md = td.turndown(editorRef.current.innerHTML);
    alert("Full Markdown:\n\n" + md);
  };

  const handleInput = () => {
    if (editorRef.current?.querySelector(".text-gray-500")) {
      editorRef.current.innerHTML = "";
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div>
      {/* Floating Toolbar */}
      {toolbarVisible && (
        <div
          className="floating-toolbar flex gap-2 p-2 rounded shadow"
          style={{
            position: "absolute",
            top: toolbarPos.top,
            left: toolbarPos.left,
            background: "white",
            zIndex: 10,
          }}
        >
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat("bold"); }}>
            <Bold className="w-4 h-4" />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat("italic"); }}>
            <Italic className="w-4 h-4" />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat("underline"); }}>
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat("strikeThrough"); }}>
            <Strikethrough className="w-4 h-4" />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat("formatBlock", "blockquote"); }}>
            <Quote className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setLinkInputVisible(true);
              setTimeout(() => {
                linkInputRef.current?.focus();
                showToolbar();
              }, 0);
            }}
          >
            <Link2 className="w-4 h-4" />
          </button>
          {linkInputVisible && (
            <input
              ref={linkInputRef}
              type="text"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmInsertLink();
                }
              }}
              style={{ padding: "0.25rem", fontSize: "0.875rem" }}
            />
          )}
        </div>
      )}
      {/* Main Editor */}
      <div className="border border-gray-300 rounded-md my-4 relative">
        {/* Top toolbar (optional additional controls) */}
        <div className="flex flex-wrap gap-2 p-2 border-b border-gray-300 bg-gray-50">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const Icon = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][n - 1];
            return (
              <button
                key={n}
                onClick={() => toggleHeading(`h${n}`)}
                title={`Heading ${n}`}
                className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
          <button onClick={() => handleFormat("bold")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Bold className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("italic")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Italic className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("underline")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <UnderlineIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("strikeThrough")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Strikethrough className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("insertUnorderedList")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <List className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("insertOrderedList")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <ListOrdered className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("formatBlock", "blockquote")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Quote className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) {
                const linkText = prompt("Enter link text:", url) || url;
                handleInsertHTML(
                  `<a href=\"${url}\" target=\"_blank\" rel=\"noopener\" class=\"text-blue-600 underline\">${linkText}</a>`
                );
              }
            }}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            <Link2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const url = prompt("Enter image URL:");
              if (url)
                handleInsertHTML(
                  `<img src=\"${url}\" alt=\"img\" class=\"max-w-full h-auto my-4 rounded\" />`
                );
            }}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              handleInsertHTML(
                `<table class=\"mx-auto border-collapse w-full my-4\">
  <tr>
    <th class=\"border p-2 bg-gray-50\">Header</th>
    <th class=\"border p-2 bg-gray-50\">Header</th>
  </tr>
  <tr>
    <td class=\"border p-2\">Cell</td>
    <td class=\"border p-2\">Cell</td>
  </tr>
</table>`
              )
            }
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            <TableIcon className="w-5 h-5" />
          </button>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button onClick={toggleCodeBlock} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Code2 className="w-5 h-5" />
          </button>
          <button onClick={viewAllMarkdown} className="ml-auto p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            View MD
          </button>
          <button 
            onClick={exitFormatting} 
            title="Exit Formatting (Esc)"
            className="hidden sm:inline-block p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            Exit
          </button>
          <button 
            onClick={exitFormatting} 
            title="Exit Formatting"
            className="sm:hidden p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            Exit
          </button>
        </div>
        <div
          ref={editorRef}
          className="editor-content min-h-[500px] p-4 outline-none bg-[#f0f0ff]"
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          suppressContentEditableWarning
        />
      </div>
      <style jsx global>{`
        .floating-toolbar button {
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .floating-toolbar button:hover {
          color: #555;
        }
        .editor-content {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          padding: 1.5rem;
          font-size: 1.125rem;
          background: #fff;
          color: #333;
        }
        .editor-content:focus {
          outline: none;
        }
        .editor-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1.5rem 0;
        }
        .editor-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.25rem 0;
        }
        .editor-content h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 1rem 0;
        }
        .editor-content p {
          margin: 1rem 0;
        }
        .editor-content blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          color: #666;
          margin: 1rem 0;
          font-style: italic;
        }
        @media (max-width: 640px) {
          .flex.flex-wrap {
            flex-direction: column;
          }
          .editor-content {
            padding: 1rem;
            min-height: 300px;
          }
          button {
            font-size: 1rem;
            padding: 0.5rem;
          }
          .floating-toolbar {
            left: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Editor;