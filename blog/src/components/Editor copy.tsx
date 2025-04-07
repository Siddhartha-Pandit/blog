"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  ListOrdered,
  List,
  RotateCcw,
  RotateCw,
  Link2,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Image,
  Video,
  Table,
} from "lucide-react";

// --- Helper Functions for Colors ---
const hexToRgb = (hex: string) => {
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const bigint = parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const getLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722;
};

const getContrastRatio = (hex1: string, hex2: string): number => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
  let rNorm = r / 255,
    gNorm = g / 255,
    bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h = h * 60;
  }
  return { h, s, l };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h = h % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h < 60) {
    r1 = c;
    g1 = x;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
  } else if (h < 180) {
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const getNearestContrastColor = (
  originalHex: string,
  threshold: number,
  bgDark: string,
  bgLight: string
): string => {
  const { h, s, l } = rgbToHsl(hexToRgb(originalHex));
  if (
    getContrastRatio(originalHex, bgDark) >= threshold &&
    getContrastRatio(originalHex, bgLight) >= threshold
  ) {
    return originalHex;
  }
  const step = 0.01;
  let candidateUp: string | null = null;
  let candidateDown: string | null = null;
  for (let d = step; d <= 1; d += step) {
    const lUp = Math.min(l + d, 1);
    const candidateHexUp = hslToHex(h, s, lUp);
    if (
      getContrastRatio(candidateHexUp, bgDark) >= threshold &&
      getContrastRatio(candidateHexUp, bgLight) >= threshold
    ) {
      candidateUp = candidateHexUp;
      break;
    }
  }
  for (let d = step; d <= 1; d += step) {
    const lDown = Math.max(l - d, 0);
    const candidateHexDown = hslToHex(h, s, lDown);
    if (
      getContrastRatio(candidateHexDown, bgDark) >= threshold &&
      getContrastRatio(candidateHexDown, bgLight) >= threshold
    ) {
      candidateDown = candidateHexDown;
      break;
    }
  }
  if (candidateUp && candidateDown) {
    const diffUp = Math.abs(rgbToHsl(hexToRgb(candidateUp)).l - l);
    const diffDown = Math.abs(rgbToHsl(hexToRgb(candidateDown)).l - l);
    return diffUp < diffDown ? candidateUp : candidateDown;
  }
  return candidateUp || candidateDown || originalHex;
};

// --- Table Manipulation Functions ---
const getCurrentTableCell = (): HTMLTableCellElement | null => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  let node = selection.getRangeAt(0).startContainer as HTMLElement;
  while (node && node !== document.body) {
    if (
      node.tagName &&
      (node.tagName.toLowerCase() === "td" ||
        node.tagName.toLowerCase() === "th")
    ) {
      return node as HTMLTableCellElement;
    }
    node = node.parentElement as HTMLElement;
  }
  return null;
};

const handleAddRow = () => {
  const cell = getCurrentTableCell();
  if (!cell) {
    alert("Place the cursor inside a table cell to add a row.");
    return;
  }
  const row = cell.parentElement as HTMLTableRowElement;
  let table = row.parentElement;
  if (table && table.tagName.toLowerCase() === "tbody") {
    table = table.parentElement;
  }
  if (!table || table.tagName.toLowerCase() !== "table") {
    alert("Unable to locate the table.");
    return;
  }
  const tableElement = table as HTMLTableElement;
  const rowIndex = Array.from(tableElement.rows).indexOf(row);
  const newRow = tableElement.insertRow(rowIndex + 1);
  for (let i = 0; i < row.cells.length; i++) {
    const newCell = newRow.insertCell(i);
    newCell.innerHTML = "&nbsp;";
    newCell.style.border = "1px solid black";
    newCell.style.padding = "5px";
  }
};

const handleAddColumn = () => {
  const cell = getCurrentTableCell();
  if (!cell) {
    alert("Place the cursor inside a table cell to add a column.");
    return;
  }
  const currentRow = cell.parentElement as HTMLTableRowElement;
  const cellIndex = Array.from(currentRow.cells).indexOf(cell);
  let table = currentRow.parentElement;
  if (table && table.tagName.toLowerCase() === "tbody") {
    table = table.parentElement;
  }
  if (!table || table.tagName.toLowerCase() !== "table") {
    alert("Unable to locate the table.");
    return;
  }
  const tableElement = table as HTMLTableElement;
  for (let i = 0; i < tableElement.rows.length; i++) {
    const row = tableElement.rows[i];
    const newCell = row.insertCell(cellIndex + 1);
    newCell.innerHTML = "&nbsp;";
    newCell.style.border = "1px solid black";
    newCell.style.padding = "5px";
  }
};

const handleRemoveTable = () => {
  const cell = getCurrentTableCell();
  if (!cell) {
    alert("Place the cursor inside a table to remove it.");
    return;
  }
  let table = cell.parentElement;
  if (table && table.tagName.toLowerCase() === "tr") {
    table = table.parentElement;
    if (table && table.tagName.toLowerCase() === "tbody") {
      table = table.parentElement;
    }
  }
  if (table && table.tagName.toLowerCase() === "table") {
    table.parentNode?.removeChild(table);
  } else {
    alert("Unable to remove the table.");
  }
};

// --- Editor Component ---
const Editor: React.FC = () => {
  const [data, setData] = useState<string>("");
  const [fontNameOptions, setFontNameOptions] = useState<React.JSX.Element[]>([]);
  const [fontSizeOptions, setFontSizeOptions] = useState<React.JSX.Element[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlData, setHtmlData] = useState("");

  // Define header styles
  const headerStyles = {
    base: {
      color: "#2c3e50",
      fontFamily: "Arial, sans-serif",
      margin: "10px 0",
    },
    H1: {
      fontSize: "2.5em",
      borderBottom: "2px solid #cafe00",
    },
    H2: {
      fontSize: "2em",
      color: "#3498db",
      borderBottom: "none",
    },
    H3: {
      fontSize: "1.75em",
      color: "#2c3e50",
    },
    H4: {
      fontSize: "1.5em",
      color: "#2c3e50",
    },
    H5: {
      fontSize: "1.25em",
      color: "#2c3e50",
    },
    H6: {
      fontSize: "1em",
      color: "#2c3e50",
      fontWeight: "bold",
    },
  };

  useEffect(() => {
    const fontList: string[] = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Garamond",
      "Georgia",
      "Courier New",
      "cursive",
    ];
    const fontOptions = fontList.map((font, index) => (
      <option key={index} value={font}>
        {font}
      </option>
    ));
    const sizeOptions: React.JSX.Element[] = [];
    for (let i = 1; i <= 7; i++) {
      sizeOptions.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    setFontNameOptions(fontOptions);
    setFontSizeOptions(sizeOptions);

    // Set default paragraph separator to <p>
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  // --- Manual Bold Toggle Implementation ---
  const handleButtonClick = (command: string, value?: string) => {
    if (command === "bold") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
    
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
    
      // Check if selection is already within a <b> or <strong>
      let currentNode: Node | null = selection.anchorNode;
      console.log("currentNode",currentNode)
      while (currentNode && currentNode !== editorRef.current) {
        if (
          currentNode instanceof HTMLElement &&
          (currentNode.tagName.toLowerCase() === "b" ||
            currentNode.tagName.toLowerCase() === "strong")
        ) {
          // Already bold — remove bold formatting
          const parent = currentNode.parentNode;
          console.log("parent",parent)
          if (!parent) break;
          while (currentNode.firstChild) {
            parent.insertBefore(currentNode.firstChild, currentNode);
          }
          parent.removeChild(currentNode);
          selection.removeAllRanges();
          return;
        }
        currentNode = currentNode.parentNode;
      }
    
      // Apply bold by wrapping in <b> tag
      const bold = document.createElement("b");
      bold.appendChild(range.extractContents());
      range.insertNode(bold);
      selection.removeAllRanges();
    }
    

    if (command === "insertImage") {
      const url = prompt("Enter the image URL:");
      if (url) {
        document.execCommand("insertImage", false, url);
      }
      return;
    }

    if (command === "insertVideo") {
      const url = prompt("Enter the video URL:");
      if (url) {
        const videoHTML = `<video controls src="${url}" width="320" height="240"></video>`;
        document.execCommand("insertHTML", false, videoHTML);
      }
      return;
    }

    if (command === "insertTable") {
      const rows = prompt("Enter number of rows:", "2");
      const cols = prompt("Enter number of columns:", "2");
      if (rows && cols) {
        const rowNum = parseInt(rows, 10);
        const colNum = parseInt(cols, 10);
        let tableHTML = `<table style="border: 1px solid black; border-collapse: collapse;">`;
        for (let i = 0; i < rowNum; i++) {
          tableHTML += "<tr>";
          for (let j = 0; j < colNum; j++) {
            tableHTML += `<td style="border: 1px solid black; padding: 5px;">&nbsp;</td>`;
          }
          tableHTML += "</tr>";
        }
        tableHTML += "</table>";
        document.execCommand("insertHTML", false, tableHTML);
      }
      return;
    }

    // Fallback for other commands using execCommand
    document.execCommand(command, false, value || undefined);
  };

  const handleAdvancedOptionChange = (command: string, value: string) => {
    const threshold = 4.5;
    if (command === "formatBlock") {
      const tagName = value.toUpperCase();
      document.execCommand("formatBlock", false, tagName);
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          const range = sel.getRangeAt(0);
          let headerElement: Node | null = range.commonAncestorContainer;
          while (
            headerElement &&
            (!(headerElement instanceof HTMLElement) ||
              !headerElement.tagName.match(/^H[1-6]$/i))
          ) {
            headerElement = headerElement.parentElement;
          }
          if (headerElement instanceof HTMLElement) {
            Object.keys(headerStyles.base).forEach((style) => {
              headerElement.style[style as any] = "";
            });
            Object.values(headerStyles).forEach((levelStyles) => {
              Object.keys(levelStyles).forEach((style) => {
                headerElement.style[style as any] = "";
              });
            });
            Object.entries(headerStyles.base).forEach(([prop, val]) => {
              headerElement.style[prop as any] = val;
            });
            if (headerStyles[tagName]) {
              Object.entries(headerStyles[tagName]).forEach(([prop, val]) => {
                headerElement.style[prop as any] = val;
              });
            }
            if (editorRef.current) {
              setHtmlData(editorRef.current.innerHTML);
            }
          }
        }
      }, 10);
      return;
    }
    if (command === "foreColor" || command === "backColor") {
      const contrastDark = getContrastRatio(value, "#1e1e1e");
      const contrastLight = getContrastRatio(value, "#FAF9F6");
      if (contrastDark < threshold || contrastLight < threshold) {
        const newColor = getNearestContrastColor(
          value,
          threshold,
          "#1e1e1e",
          "#FAF9F6"
        );
        document.execCommand(command, false, newColor);
        return;
      }
    }
    document.execCommand(command, false, value);
  };

  const handleViewHTML = () => {
    if (editorRef.current) {
      console.log("Editor HTML content:", editorRef.current.innerHTML);
    }
  };

  const handleSetItem = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData(e.target.value);
  };

  const handleSave = () => {
    console.log("Saving data:", data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="container">
        <div
          className="toolbar"
          style={{
            marginBottom: "10px",
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
          }}
        >
          <button id="save" className="option-button format" onClick={handleSave}>
            <Save size={16} />
          </button>
          <button id="bold" className="option-button format" onClick={() => handleButtonClick("bold")}>
            <Bold size={16} />
          </button>
          <button id="italic" className="option-button format" onClick={() => handleButtonClick("italic")}>
            <Italic size={16} />
          </button>
          <button id="underline" className="option-button format" onClick={() => handleButtonClick("underline")}>
            <Underline size={16} />
          </button>
          <button id="strikeout" className="option-button format" onClick={() => handleButtonClick("strikeThrough")}>
            <Strikethrough size={16} />
          </button>
          <button id="superscript" className="option-button format" onClick={() => handleButtonClick("superscript")}>
            <Superscript size={16} />
          </button>
          <button id="subscript" className="option-button format" onClick={() => handleButtonClick("subscript")}>
            <Subscript size={16} />
          </button>
          <button
            id="insertOrderedList"
            className="option-button"
            onClick={() => handleButtonClick("insertOrderedList")}
          >
            <ListOrdered size={16} />
          </button>
          <button
            id="insertUnorderedList"
            className="option-button"
            onClick={() => handleButtonClick("insertUnorderedList")}
          >
            <List size={16} />
          </button>
          <button id="undo" className="option-button" onClick={() => handleButtonClick("undo")}>
            <RotateCcw size={16} />
          </button>
          <button id="redo" className="option-button" onClick={() => handleButtonClick("redo")}>
            <RotateCw size={16} />
          </button>
          <button id="createLink" className="option-button" onClick={() => handleButtonClick("createLink")}>
            <Link2 size={16} />
          </button>
          <button id="unlink" className="option-button" onClick={() => handleButtonClick("unlink")}>
            <Unlink size={16} />
          </button>
          <button id="insertImage" className="option-button" onClick={() => handleButtonClick("insertImage")}>
            <Image size={16} />
          </button>
          <button id="insertVideo" className="option-button" onClick={() => handleButtonClick("insertVideo")}>
            <Video size={16} />
          </button>
          <button id="insertTable" className="option-button" onClick={() => handleButtonClick("insertTable")}>
            <Table size={16} />
          </button>
          <button className="option-button" onClick={handleAddRow}>
            Add Row
          </button>
          <button className="option-button" onClick={handleAddColumn}>
            Add Column
          </button>
          <button className="option-button" onClick={handleRemoveTable}>
            Remove Table
          </button>
          <button id="justifyLeft" className="option-button align" onClick={() => handleButtonClick("justifyLeft")}>
            <AlignLeft size={16} />
          </button>
          <button id="justifyCenter" className="option-button align" onClick={() => handleButtonClick("justifyCenter")}>
            <AlignCenter size={16} />
          </button>
          <button id="justifyRight" className="option-button align" onClick={() => handleButtonClick("justifyRight")}>
            <AlignRight size={16} />
          </button>
          <button id="justifyFull" className="option-button align" onClick={() => handleButtonClick("justifyFull")}>
            <AlignJustify size={16} />
          </button>
          <button id="indent" className="option-button spacing" onClick={() => handleButtonClick("indent")}>
            <Indent size={16} />
          </button>
          <button id="outdent" className="option-button spacing" onClick={() => handleButtonClick("outdent")}>
            <Outdent size={16} />
          </button>
          <select
            id="formatBlock"
            className="adv-option-button"
            onChange={(e) => handleAdvancedOptionChange("formatBlock", e.target.value)}
          >
            <option value="H1">H1</option>
            <option value="H2">H2</option>
            <option value="H3">H3</option>
            <option value="H4">H4</option>
            <option value="H5">H5</option>
            <option value="H6">H6</option>
          </select>
          <select
            id="fontName"
            className="adv-option-button"
            onChange={(e) => handleAdvancedOptionChange("fontName", e.target.value)}
          >
            {fontNameOptions}
          </select>
          <select
            id="fontSize"
            className="adv-option-button"
            defaultValue="3"
            onChange={(e) => handleAdvancedOptionChange("fontSize", e.target.value)}
          >
            {fontSizeOptions}
          </select>
          <div className="input-wrapper">
            <input
              type="color"
              id="foreColor"
              className="adv-option-button"
              onChange={(e) => handleAdvancedOptionChange("foreColor", e.target.value)}
            />
            <label htmlFor="foreColor">Font Color</label>
          </div>
          <div className="input-wrapper">
            <input
              type="color"
              id="backColor"
              className="adv-option-button"
              onChange={(e) => handleAdvancedOptionChange("backColor", e.target.value)}
            />
            <label htmlFor="backColor">Highlight Color</label>
          </div>
          <button className="option-button" onClick={handleViewHTML}>
            View HTML
          </button>
        </div>
        <div
          id="text-input"
          ref={editorRef}
          contentEditable="true"
          onInput={(e: React.FormEvent<HTMLDivElement>) =>
            setData(e.currentTarget.textContent || "")
          }
          style={{
            border: "1px solid #ccc",
            minHeight: "300px",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: "#fff",
          }}
        />
      </div>
    </div>
  );
};

export default Editor;

// // /////////////////////////////////////////
// "use client";

// import { useState, useRef, useEffect } from "react";
// import {
//   Bold,
//   Italic,
//   Underline as UnderlineIcon,
//   Strikethrough,
//   ListOrdered,
//   List,
//   Link2,
//   Image as ImageIcon,
//   Table as TableIcon,
//   Quote,
//   Heading1,
//   Heading2,
//   Heading3,
//   Heading4,
//   Heading5,
//   Heading6,
//   Code2,
// } from "lucide-react";
// import TurndownService from "turndown";

// const LANGUAGES = [
//   "text",
//   "javascript",
//   "python",
//   "java",
//   "c",
//   "cpp",
//   "csharp",
//   "php",
//   "ruby",
//   "go",
//   "typescript",
//   "html",
//   "css",
//   "sql",
//   "swift",
//   "kotlin",
//   "rust",
// ];

// const Editor = () => {
//   const editorRef = useRef(null);
//   const savedSelection = useRef(null);
//   const [selectedLanguage, setSelectedLanguage] = useState("text");
//   const [toolbarVisible, setToolbarVisible] = useState(false);
//   const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
//   // Use modal state for link insertion
//   const [linkModalVisible, setLinkModalVisible] = useState(false);
//   const [linkUrl, setLinkUrl] = useState("");
//   const linkInputRef = useRef(null);

//   // Save and restore selection functions
//   const saveSelection = () => {
//     const sel = window.getSelection();
//     if (sel?.rangeCount) {
//       savedSelection.current = sel.getRangeAt(0);
//     }
//   };

//   const restoreSelection = () => {
//     if (savedSelection.current) {
//       const sel = window.getSelection();
//       sel?.removeAllRanges();
//       sel?.addRange(savedSelection.current);
//     }
//   };

//   const handleFormat = (cmd, val) => {
//     saveSelection();
//     document.execCommand(cmd, false, val);
//     restoreSelection();
//     editorRef.current?.focus();
//     hideToolbar();
//   };

//   const toggleHeading = (tag) => {
//     saveSelection();
//     const current = document.queryCommandValue("formatBlock").toLowerCase();
//     const clean = current.replace(/[<>]/g, "");
//     document.execCommand("formatBlock", false, clean === tag.toLowerCase() ? "p" : tag);
//     restoreSelection();
//     editorRef.current?.focus();
//     hideToolbar();
//   };

//   const handleInsertHTML = (html) => {
//     saveSelection();
//     document.execCommand("insertHTML", false, html);
//     restoreSelection();
//     editorRef.current?.focus();
//     hideToolbar();
//   };

//   // Code block helpers
//   const isInCodeBlock = () => {
//     const sel = window.getSelection();
//     if (!sel?.anchorNode) return false;
//     let node = sel.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (
//         node.nodeType === Node.ELEMENT_NODE &&
//         node.classList.contains("code-block-container")
//       ) {
//         return true;
//       }
//       node = node.parentNode;
//     }
//     return false;
//   };

//   const getCodeBlockContainer = () => {
//     const sel = window.getSelection();
//     if (!sel?.anchorNode) return null;
//     let node = sel.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (
//         node.nodeType === Node.ELEMENT_NODE &&
//         node.classList.contains("code-block-container")
//       ) {
//         return node;
//       }
//       node = node.parentNode;
//     }
//     return null;
//   };

//   const insertCodeBlock = () => {
//     const html = `
// <div class="code-block-container my-4 border rounded overflow-hidden max-w-2xl">
//   <div class="code-block-header flex justify-between items-center bg-gray-200 px-2 py-1 text-xs font-mono">
//     <select class="code-lang-dropdown">
//       ${LANGUAGES.map(
//         (lang) =>
//           `<option value="${lang}" ${lang === selectedLanguage ? "selected" : ""}>${lang}</option>`
//       ).join("")}
//     </select>
//     <div class="flex space-x-2">
//       <button class="copy-code-btn px-1 rounded bg-white hover:bg-gray-100">
//         ${"<svg xmlns='http://www.w3.org/2000/svg' class='w-4 h-4' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M0 0h24v24H0z' stroke='none'/><rect x='8' y='8' width='12' height='12' rx='2'/><path d='M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2'/></svg>"}
//       </button>
//       <button class="view-md-btn px-1 rounded bg-white hover:bg-gray-100">MD</button>
//     </div>
//   </div>
//   <pre class="bg-gray-100 p-4 overflow-x-auto"><code class="language-${selectedLanguage}">\u200B</code></pre>
// </div>`;
//     handleInsertHTML(html);
//   };

//   const toggleCodeBlock = () => {
//     const container = getCodeBlockContainer();
//     if (container) {
//       container.remove();
//     } else {
//       insertCodeBlock();
//     }
//   };

//   // Blockquote helpers
//   const getBlockquoteElement = () => {
//     const sel = window.getSelection();
//     if (!sel?.anchorNode) return null;
//     let node = sel.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (
//         node.nodeType === Node.ELEMENT_NODE &&
//         node.nodeName === "BLOCKQUOTE"
//       ) {
//         return node;
//       }
//       node = node.parentNode;
//     }
//     return null;
//   };

//   const toggleBlockquote = () => {
//     const sel = window.getSelection();
//     if (!sel || sel.rangeCount === 0) return;
//     if (getBlockquoteElement()) {
//       exitBlockquote();
//       return;
//     }
//     const range = sel.getRangeAt(0);
//     const blockquote = document.createElement("blockquote");
//     const fragment = range.extractContents();
//     blockquote.appendChild(fragment);
//     range.insertNode(blockquote);
//     const newRange = document.createRange();
//     newRange.selectNodeContents(blockquote);
//     newRange.collapse(false);
//     sel.removeAllRanges();
//     sel.addRange(newRange);
//   };

//   const exitBlockquote = () => {
//     const blockquote = getBlockquoteElement();
//     if (blockquote && editorRef.current) {
//       const newParagraph = document.createElement("p");
//       newParagraph.innerHTML = "<br>";
//       blockquote.parentNode?.insertBefore(newParagraph, blockquote.nextSibling);
//       const range = document.createRange();
//       range.setStart(newParagraph, 0);
//       range.collapse(true);
//       const sel = window.getSelection();
//       sel?.removeAllRanges();
//       sel?.addRange(range);
//     }
//   };

//   // Link helpers
//   const getLinkElement = () => {
//     const sel = window.getSelection();
//     if (!sel?.anchorNode) return null;
//     let node = sel.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "A") {
//         return node;
//       }
//       node = node.parentNode;
//     }
//     return null;
//   };

//   const exitLink = () => {
//     const linkEl = getLinkElement();
//     if (linkEl && editorRef.current) {
//       const parent = linkEl.parentNode;
//       const offset = Array.from(parent.childNodes).indexOf(linkEl) + 1;
//       const range = document.createRange();
//       range.setStart(parent, offset);
//       range.collapse(true);
//       const sel = window.getSelection();
//       sel?.removeAllRanges();
//       sel?.addRange(range);
//     }
//   };

//   const exitCodeBlock = () => {
//     const container = getCodeBlockContainer();
//     if (container && editorRef.current) {
//       const newParagraph = document.createElement("p");
//       newParagraph.innerHTML = "<br>";
//       container.parentNode?.insertBefore(newParagraph, container.nextSibling);
//       const range = document.createRange();
//       range.setStart(newParagraph, 0);
//       range.collapse(true);
//       const sel = window.getSelection();
//       sel?.removeAllRanges();
//       sel?.addRange(range);
//     }
//   };

//   // Exit formatting for any active element.
//   const exitFormatting = () => {
//     if (getCodeBlockContainer()) exitCodeBlock();
//     else if (getLinkElement()) exitLink();
//     else if (getBlockquoteElement()) exitBlockquote();
//   };

//   // ---------- Link insertion via modal ----------
//   const confirmInsertLink = () => {
//     // Restore the saved selection before applying the link.
//     restoreSelection();
//     const sel = window.getSelection();
//     let selectedText = sel ? sel.toString() : "";
//     if (!selectedText) {
//       selectedText = linkUrl;
//     }
//     const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener" class="text-blue-600 underline">${selectedText}</a>`;
//     document.execCommand("insertHTML", false, linkHTML);
//     setLinkUrl("");
//     setLinkModalVisible(false);
//     editorRef.current?.focus();
//   };

//   // ---------- Floating Toolbar State & Positioning ----------
//   const showToolbar = () => {
//     const sel = window.getSelection();
//     if (!sel || sel.isCollapsed) {
//       setToolbarVisible(false);
//       return;
//     }
//     const range = sel.getRangeAt(0);
//     const rect = range.getBoundingClientRect();
//     setToolbarPos({
//       top: rect.top - 45 + window.scrollY,
//       left: rect.left + rect.width / 2 - 100 + window.scrollX,
//     });
//     setToolbarVisible(true);
//   };

//   const hideToolbar = () => {
//     setToolbarVisible(false);
//     // We don't want to close the modal if it's already open
//     if (!linkModalVisible) {
//       setLinkModalVisible(false);
//     }
//   };

//   // Listen for selection changes to update floating toolbar.
//   useEffect(() => {
//     const handleSelectionChange = () => {
//       // If the link modal is open, do not auto-hide the toolbar.
//       if (linkModalVisible) return;
//       const sel = window.getSelection();
//       if (sel && !sel.isCollapsed && editorRef.current.contains(sel.anchorNode)) {
//         showToolbar();
//       } else {
//         hideToolbar();
//       }
//     };
//     document.addEventListener("mouseup", handleSelectionChange);
//     document.addEventListener("keyup", handleSelectionChange);
//     return () => {
//       document.removeEventListener("mouseup", handleSelectionChange);
//       document.removeEventListener("keyup", handleSelectionChange);
//     };
//   }, [linkModalVisible]);

//   // Keydown handler – pressing Escape cancels formatting.
//   useEffect(() => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     const keydownHandler = (e) => {
//       if (e.key === "Escape") {
//         e.preventDefault();
//         exitFormatting();
//         setLinkModalVisible(false);
//       } else if (e.key === "Enter") {
//         if (getBlockquoteElement()) {
//           e.preventDefault();
//           exitBlockquote();
//           document.execCommand("insertParagraph", false, null);
//         }
//       }
//     };
//     editor.addEventListener("keydown", keydownHandler);
//     return () => editor.removeEventListener("keydown", keydownHandler);
//   }, []);

//   // Additional event listeners for code block buttons and language changes.
//   useEffect(() => {
//     const handler = (e) => {
//       const target = e.target;
//       if (target.matches(".copy-code-btn")) {
//         const codeEl = target.closest(".code-block-container")?.querySelector("code");
//         if (codeEl) {
//           navigator.clipboard.writeText(codeEl.textContent || "");
//           target.textContent = "Copied!";
//           setTimeout(() => (target.textContent = "Copy"), 2000);
//         }
//         e.stopPropagation();
//       }
//       if (target.matches(".view-md-btn")) {
//         const codeEl = target.closest(".code-block-container")?.querySelector("code");
//         if (codeEl) {
//           const lang = codeEl.className.replace("language-", "");
//           const text = codeEl.textContent || "";
//           alert(`\`\`\`${lang}\n${text}\n\`\`\``);
//         }
//         e.stopPropagation();
//       }
//     };
//     document.addEventListener("click", handler);
//     return () => document.removeEventListener("click", handler);
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       const target = e.target;
//       if (target && target.classList.contains("code-lang-dropdown")) {
//         const newLang = target.value;
//         const container = target.closest(".code-block-container");
//         if (container) {
//           const codeEl = container.querySelector("pre code");
//           if (codeEl) {
//             codeEl.className = `language-${newLang}`;
//           }
//         }
//       }
//     };
//     document.addEventListener("change", handler);
//     return () => document.removeEventListener("change", handler);
//   }, []);

//   const viewAllMarkdown = () => {
//     if (!editorRef.current) return;
//     const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
//     // Convert code blocks as before
//     td.addRule("codeBlocks", {
//       filter: (node) =>
//         node.nodeName === "PRE" &&
//         node.firstChild?.nodeName === "CODE" &&
//         node.firstChild.className.startsWith("language-"),
//       replacement: (_c, node) => {
//         const codeNode = node.firstChild;
//         const lang = codeNode.className.replace("language-", "");
//         return `\`\`\`${lang}\n${codeNode.textContent}\n\`\`\`\n\n`;
//       },
//     });
//     // Convert inline code as before
//     td.addRule("inlineCode", {
//       filter: "code",
//       replacement: (content, node) =>
//         node.parentNode?.nodeName === "PRE" ? content : `\`${content}\``,
//     });
//     // New rule for links: converts <a> to markdown link syntax
//     td.addRule("links", {
//       filter: (node) => node.nodeName === "A",
//       replacement: (content, node) => {
//         const href = node.getAttribute("href");
//         return `[${content}](${href})`;
//       },
//     });
//     const md = td.turndown(editorRef.current.innerHTML);
//     alert("Full Markdown:\n\n" + md);
//   };

//   const handleInput = () => {
//     if (editorRef.current?.querySelector(".text-gray-500")) {
//       editorRef.current.innerHTML = "";
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const text = e.clipboardData.getData("text/plain");
//     document.execCommand("insertText", false, text);
//   };

//   return (
//     <div>
//       {/* Floating Toolbar */}
//       {toolbarVisible && (
//         <div
//           className="floating-toolbar flex gap-2 p-2 rounded shadow"
//           style={{
//             position: "absolute",
//             top: toolbarPos.top,
//             left: toolbarPos.left,
//             background: "white",
//             zIndex: 10,
//           }}
//         >
//           <button onMouseDown={(e) => { e.preventDefault(); handleFormat("bold"); }}>
//             <Bold className="w-4 h-4" />
//           </button>
//           <button onMouseDown={(e) => { e.preventDefault(); handleFormat("italic"); }}>
//             <Italic className="w-4 h-4" />
//           </button>
//           <button onMouseDown={(e) => { e.preventDefault(); handleFormat("underline"); }}>
//             <UnderlineIcon className="w-4 h-4" />
//           </button>
//           <button onMouseDown={(e) => { e.preventDefault(); handleFormat("strikeThrough"); }}>
//             <Strikethrough className="w-4 h-4" />
//           </button>
//           <button onMouseDown={(e) => { e.preventDefault(); handleFormat("formatBlock", "blockquote"); }}>
//             <Quote className="w-4 h-4" />
//           </button>
//           <button
//             onMouseDown={(e) => {
//               e.preventDefault();
//               saveSelection();
//               setLinkModalVisible(true);
//               // Delay focus so that the modal input is rendered
//               setTimeout(() => linkInputRef.current?.focus(), 0);
//             }}
//           >
//             <Link2 className="w-4 h-4" />
//           </button>
//         </div>
//       )}
//       {/* Main Editor */}
//       <div className="border border-gray-300 rounded-md my-4 relative">
//         {/* Top toolbar with additional controls */}
//         <div className="flex flex-wrap gap-2 p-2 border-b border-gray-300 bg-gray-50">
//           {[1, 2, 3, 4, 5, 6].map((n) => {
//             const Icon = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][n - 1];
//             return (
//               <button
//                 key={n}
//                 onClick={() => toggleHeading(`h${n}`)}
//                 title={`Heading ${n}`}
//                 className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//               >
//                 <Icon className="w-5 h-5" />
//               </button>
//             );
//           })}
//           <button onClick={() => handleFormat("bold")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <Bold className="w-5 h-5" />
//           </button>
//           <button onClick={() => handleFormat("italic")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <Italic className="w-5 h-5" />
//           </button>
//           <button onClick={() => handleFormat("underline")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <UnderlineIcon className="w-5 h-5" />
//           </button>
//           <button onClick={() => handleFormat("strikeThrough")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <Strikethrough className="w-5 h-5" />
//           </button>
//           <button onClick={() => handleFormat("insertUnorderedList")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <List className="w-5 h-5" />
//           </button>
//           <button onClick={() => handleFormat("insertOrderedList")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <ListOrdered className="w-5 h-5" />
//           </button>
//           <button onClick={() => handleFormat("formatBlock", "blockquote")} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <Quote className="w-5 h-5" />
//           </button>
//           <button
//             onClick={() => {
//               const url = prompt("Enter URL:");
//               if (url) {
//                 const linkText = prompt("Enter link text:", url) || url;
//                 handleInsertHTML(
//                   `<a href="${url}" target="_blank" rel="noopener" class="text-blue-600 underline">${linkText}</a>`
//                 );
//               }
//             }}
//             className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//           >
//             <Link2 className="w-5 h-5" />
//           </button>
//           <button
//             onClick={() => {
//               const url = prompt("Enter image URL:");
//               if (url)
//                 handleInsertHTML(
//                   `<img src="${url}" alt="img" class="max-w-full h-auto my-4 rounded" />`
//                 );
//             }}
//             className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//           >
//             <ImageIcon className="w-5 h-5" />
//           </button>
//           <button
//             onClick={() =>
//               handleInsertHTML(
//                 `<table class="mx-auto border-collapse w-full my-4">
//   <tr>
//     <th class="border p-2 bg-gray-50">Header</th>
//     <th class="border p-2 bg-gray-50">Header</th>
//   </tr>
//   <tr>
//     <td class="border p-2">Cell</td>
//     <td class="border p-2">Cell</td>
//   </tr>
// </table>`
//               )
//             }
//             className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//           >
//             <TableIcon className="w-5 h-5" />
//           </button>
//           <select
//             value={selectedLanguage}
//             onChange={(e) => setSelectedLanguage(e.target.value)}
//             className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//           >
//             {LANGUAGES.map((lang) => (
//               <option key={lang} value={lang}>
//                 {lang}
//               </option>
//             ))}
//           </select>
//           <button onClick={toggleCodeBlock} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             <Code2 className="w-5 h-5" />
//           </button>
//           <button onClick={viewAllMarkdown} className="ml-auto p-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
//             View MD
//           </button>
//           <button 
//             onClick={exitFormatting} 
//             title="Exit Formatting (Esc)"
//             className="hidden sm:inline-block p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//           >
//             Exit
//           </button>
//           <button 
//             onClick={exitFormatting} 
//             title="Exit Formatting"
//             className="sm:hidden p-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
//           >
//             Exit
//           </button>
//         </div>
//         <div
//           ref={editorRef}
//           className="editor-content min-h-[500px] p-4 outline-none bg-[#f0f0ff]"
//           contentEditable
//           onInput={handleInput}
//           onPaste={handlePaste}
//           suppressContentEditableWarning
//         />
//       </div>
      
//       {/* Link Modal Overlay */}
//       {linkModalVisible && (
//         <div
//           className="link-modal-overlay"
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             background: "rgba(0, 0, 0, 0.3)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 20,
//           }}
//         >
//           <div
//             className="link-modal"
//             style={{
//               background: "white",
//               padding: "1rem",
//               borderRadius: "4px",
//               boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
//             }}
//           >
//             <input
//               ref={linkInputRef}
//               type="text"
//               placeholder="Enter URL..."
//               value={linkUrl}
//               onChange={(e) => setLinkUrl(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   confirmInsertLink();
//                 }
//               }}
//               style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
//             />
//             <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
//               <button
//                 onClick={confirmInsertLink}
//                 style={{ marginRight: "0.5rem", padding: "0.5rem 1rem" }}
//               >
//                 Confirm
//               </button>
//               <button
//                 onClick={() => {
//                   setLinkModalVisible(false);
//                   setLinkUrl("");
//                 }}
//                 style={{ padding: "0.5rem 1rem" }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx global>{`
//         .floating-toolbar button {
//           background: transparent;
//           border: none;
//           cursor: pointer;
//         }
//         .floating-toolbar button:hover {
//           color: #555;
//         }
//         .editor-content {
//           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
//           line-height: 1.6;
//           padding: 1.5rem;
//           font-size: 1.125rem;
//           background: #fff;
//           color: #333;
//         }
//         .editor-content:focus {
//           outline: none;
//         }
//         .editor-content h1 {
//           font-size: 2.5rem;
//           font-weight: 700;
//           margin: 1.5rem 0;
//         }
//         .editor-content h2 {
//           font-size: 2rem;
//           font-weight: 700;
//           margin: 1.25rem 0;
//         }
//         .editor-content h3 {
//           font-size: 1.75rem;
//           font-weight: 700;
//           margin: 1rem 0;
//         }
//         .editor-content p {
//           margin: 1rem 0;
//         }
//         .editor-content blockquote {
//           border-left: 4px solid #ddd;
//           padding-left: 1rem;
//           color: #666;
//           margin: 1rem 0;
//           font-style: italic;
//         }
//         @media (max-width: 640px) {
//           .flex.flex-wrap {
//             flex-direction: column;
//           }
//           .editor-content {
//             padding: 1rem;
//             min-height: 300px;
//           }
//           button {
//             font-size: 1rem;
//             padding: 0.5rem;
//           }
//           .floating-toolbar {
//             left: 10px !important;
//           }
//         }
//       `}</style>
//     </div>
  );
};

export default Editor;
