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

// --- Helper Functions ---

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
    b1 = 0;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
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
      (node.tagName.toLowerCase() === "td" || node.tagName.toLowerCase() === "th")
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

  // Define header styles in a maintainable way
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

  const handleButtonClick = (command: string, value?: string) => {
    if (command === "bold") {
      // Helper function to log full selection details
      const logFullSelection = () => {
        const selection = window.getSelection();
        if (!selection) {
          console.log("No selection available.");
          return;
        }
        console.log("Full Selection Details:");
        console.log("anchorNode:", selection.anchorNode);
        console.log("anchorOffset:", selection.anchorOffset);
        console.log("focusNode:", selection.focusNode);
        console.log("focusOffset:", selection.focusOffset);
        console.log("isCollapsed:", selection.isCollapsed);
        console.log("rangeCount:", selection.rangeCount);
        for (let i = 0; i < selection.rangeCount; i++) {
          const range = selection.getRangeAt(i);
          console.log(`Range ${i}:`);
          console.log("  startContainer:", range.startContainer);
          console.log("  startOffset:", range.startOffset);
          console.log("  endContainer:", range.endContainer);
          console.log("  endOffset:", range.endOffset);
          console.log("  collapsed:", range.collapsed);
          console.log("  text:", range.toString());
        }
      };
    
      logFullSelection();
    
      const selection = window.getSelection();
      console.log(selection);
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
    
      let currentNode: Node | null = selection.anchorNode;
      while (currentNode && currentNode !== editorRef.current) {
        if (
          currentNode instanceof HTMLElement &&
          currentNode.tagName.toLowerCase() === "span" &&
          currentNode.style.fontWeight === "bold" &&
          currentNode.style.color === "rgb(230, 0, 0)" // note: custom red may be reported as rgb
        ) {
          const parent = currentNode.parentNode;
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
    
      // If not already bold, wrap the selected text in a span with custom bold styling
      const span = document.createElement("span");
      span.style.fontWeight = "bold";
      span.style.color = "#e60000"; // Custom red color
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      return;
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
        const rowNum = parseInt(rows);
        const colNum = parseInt(cols);
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
        />
      </div>
    </div>
  );
};

export default Editor;
