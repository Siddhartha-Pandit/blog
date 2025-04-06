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
  Code,
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

// The list of supported languages.
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
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("text");

  // SVG markup for the copy icon (from Lucide).
  const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 0h24v24H0z" stroke="none"/>
    <rect x="8" y="8" width="12" height="12" rx="2"/>
    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2"/>
  </svg>`;

  // Initialize with a placeholder if empty.
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<p class="text-gray-500">Start writing...</p>';
    }
  }, []);

  // Save/restore selection.
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

  // Basic formatting functions.
  const handleFormat = (cmd: string, val?: string) => {
    saveSelection();
    document.execCommand(cmd, false, val);
    restoreSelection();
    editorRef.current?.focus();
  };

  const toggleHeading = (tag: string) => {
    saveSelection();
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    const clean = current.replace(/[<>]/g, "");
    document.execCommand("formatBlock", false, clean === tag.toLowerCase() ? "p" : tag);
    restoreSelection();
    editorRef.current?.focus();
  };

  const handleInsertHTML = (html: string) => {
    saveSelection();
    document.execCommand("insertHTML", false, html);
    restoreSelection();
    editorRef.current?.focus();
  };

  // Check if the selection is inside a code block.
  const isInCodeBlock = (): boolean => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return false;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains("code-block-container")) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  // Inline code helper.
  const getInlineCodeContainer = (): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains("inline-code-container")) {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  const toggleInlineCode = () => {
    if (isInCodeBlock()) return;
    const container = getInlineCodeContainer();
    if (container) {
      // Unwrap inline code.
      const codeEl = container.querySelector("code.inline-code");
      const text = codeEl?.textContent || "";
      container.replaceWith(document.createTextNode(text));
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const text = range.toString() || "code";
        const spanContainer = document.createElement("span");
        spanContainer.className = "inline-code-container";
        const codeNode = document.createElement("code");
        codeNode.className = "inline-code";
        codeNode.textContent = text;
        const copyBtn = document.createElement("button");
        copyBtn.className = "inline-copy-btn";
        copyBtn.innerHTML = copyIconSVG;
        copyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(codeNode.textContent || "");
          copyBtn.style.opacity = "0.6";
          setTimeout(() => (copyBtn.style.opacity = "1"), 2000);
        });
        spanContainer.appendChild(codeNode);
        spanContainer.appendChild(copyBtn);
        range.deleteContents();
        range.insertNode(spanContainer);
      }
    }
  };

  // Code-block helper.
  const getCodeBlockContainer = (): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains("code-block-container")) {
        return node as HTMLElement;
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
        (lang) => `<option value="${lang}" ${lang === selectedLanguage ? "selected" : ""}>${lang}</option>`
      ).join("")}
    </select>
    <div class="flex space-x-2">
      <button class="copy-code-btn px-1 rounded bg-white hover:bg-gray-100">${copyIconSVG}</button>
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

  // Blockquote helper.
  const getBlockquoteElement = (): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "BLOCKQUOTE") {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  // Link helper.
  const getLinkElement = (): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel?.anchorNode) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "A") {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  // Exit functions: unwrapping elements.
  const exitCodeBlock = () => {
    const container = getCodeBlockContainer();
    if (container && editorRef.current) {
      const newParagraph = document.createElement("p");
      newParagraph.innerHTML = "<br/>";
      container.parentNode?.insertBefore(newParagraph, container.nextSibling);
      const range = document.createRange();
      range.setStart(newParagraph, 0);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      editorRef.current.focus();
    }
  };

  const exitInlineCode = () => {
    const container = getInlineCodeContainer();
    if (container && editorRef.current) {
      const codeEl = container.querySelector("code.inline-code");
      const text = codeEl?.textContent || "";
      container.replaceWith(document.createTextNode(text));
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      editorRef.current.focus();
    }
  };

  const exitBlockquote = () => {
    const blockquote = getBlockquoteElement();
    if (blockquote && editorRef.current) {
      const fragment = document.createDocumentFragment();
      while (blockquote.firstChild) {
        fragment.appendChild(blockquote.firstChild);
      }
      blockquote.replaceWith(fragment);
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      editorRef.current.focus();
    }
  };

  const exitLink = () => {
    const linkEl = getLinkElement();
    if (linkEl && editorRef.current) {
      const text = linkEl.textContent || "";
      linkEl.replaceWith(document.createTextNode(text));
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      editorRef.current.focus();
    }
  };

  // Listen for Escape key to exit any formatting (code block, inline code, blockquote, or link).
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (getCodeBlockContainer()) {
          e.preventDefault();
          exitCodeBlock();
        } else if (getInlineCodeContainer()) {
          e.preventDefault();
          exitInlineCode();
        } else if (getLinkElement()) {
          e.preventDefault();
          exitLink();
        } else if (getBlockquoteElement()) {
          e.preventDefault();
          exitBlockquote();
        }
      }
    };
    editor.addEventListener("keydown", keydownHandler);
    return () => editor.removeEventListener("keydown", keydownHandler);
  }, []);

  // Handle Copy and View Markdown buttons in the code block header.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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

  // Listen for changes on code block language dropdowns.
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLSelectElement;
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

  // Full document Markdown view.
  const viewAllMarkdown = () => {
    if (!editorRef.current) return;
    const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
    td.addRule("codeBlocks", {
      filter: (node) =>
        node.nodeName === "PRE" &&
        node.firstChild?.nodeName === "CODE" &&
        (node.firstChild as HTMLElement).className.startsWith("language-"),
      replacement: (_c, node) => {
        const codeNode = node.firstChild as HTMLElement;
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

  // Remove placeholder when user starts typing.
  const handleInput = () => {
    if (editorRef.current?.querySelector(".text-gray-500")) {
      editorRef.current.innerHTML = "";
    }
  };

  // Strip formatting on paste.
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div>
      <div className="border border-gray-300 rounded-md my-4">
        {/* Toolbar */}
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
          <button onClick={() => handleFormat("bold")} title="Bold" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Bold className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("italic")} title="Italic" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Italic className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("underline")} title="Underline" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <UnderlineIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("strikeThrough")} title="Strikethrough" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Strikethrough className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("insertUnorderedList")} title="Bullet List" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <List className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("insertOrderedList")} title="Numbered List" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <ListOrdered className="w-5 h-5" />
          </button>
          <button onClick={() => handleFormat("formatBlock", "blockquote")} title="Blockquote" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Quote className="w-5 h-5" />
          </button>
          <button onClick={toggleInlineCode} title="Inline Code" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Code className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) {
                const linkText = prompt("Enter link text:", url) || url;
                handleInsertHTML(
                  `<a href="${url}" target="_blank" rel="noopener" class="text-blue-600 underline">${linkText}</a>`
                );
              }
            }}
            title="Link"
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            <Link2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const url = prompt("Enter image URL:");
              if (url)
                handleInsertHTML(
                  `<img src="${url}" alt="img" class="max-w-full h-auto my-4 rounded" />`
                );
            }}
            title="Image"
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              handleInsertHTML(
                `<table class="mx-auto border-collapse w-full my-4">
  <tr>
    <th class="border p-2 bg-gray-50">Header</th>
    <th class="border p-2 bg-gray-50">Header</th>
  </tr>
  <tr>
    <td class="border p-2">Cell</td>
    <td class="border p-2">Cell</td>
  </tr>
</table>`
              )
            }
            title="Table"
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
          <button onClick={toggleCodeBlock} title="Code Block" className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            <Code2 className="w-5 h-5" />
          </button>
          <button onClick={viewAllMarkdown} title="View Markdown" className="ml-auto p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
            View MD
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
        .inline-code-container {
          background: #f0f0f0;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
          display: inline-flex;
          align-items: center;
          gap: 0.3em;
        }
        .inline-copy-btn {
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .editor-content {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
        }
        .editor-content:focus {
          outline: none;
        }
        .editor-content h1 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1rem 0;
        }
        .editor-content h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0.875rem 0;
        }
        .editor-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.75rem 0;
        }
        .editor-content ul {
          list-style: disc;
          padding-left: 2rem;
        }
        .editor-content ol {
          list-style: decimal;
          padding-left: 2rem;
        }
        .editor-content blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Editor;
