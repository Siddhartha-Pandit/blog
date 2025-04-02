"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// --- Helper Functions ---

const hexToRgb = (hex: string) => {
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized.split("").map((char) => char + char).join("");
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
  let h = 0, s = 0, l = (max + min) / 2;
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
  let r1 = 0, g1 = 0, b1 = 0;
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

// --- Editor Component ---

const Editor: React.FC = () => {
  const [data, setData] = useState<string>("");
  const [activeButtons, setActiveButtons] = useState<string[]>([]);
  const [fontNameOptions, setFontNameOptions] = useState<React.JSX.Element[]>([]);
  const [fontSizeOptions, setFontSizeOptions] = useState<React.JSX.Element[]>([]);

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
  }, []);

  const handleButtonClick = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  const handleAdvancedOptionChange = (command: string, value: string) => {
    const threshold = 4.5;
    if (command === "formatBlock") {
      // For headers and other block-level formatting, wrap value in angle brackets.
      document.execCommand(command, false, value.toLowerCase());
      return;
    }
    if (command === "foreColor" || command === "backColor") {
      const contrastDark = getContrastRatio(value, "#1e1e1e");
      const contrastLight = getContrastRatio(value, "#FAF9F6");
      if (contrastDark < threshold || contrastLight < threshold) {
        const newColor = getNearestContrastColor(value, threshold, "#1e1e1e", "#FAF9F6");
        document.execCommand(command, false, newColor);
        return;
      }
    }
    document.execCommand(command, false, value);
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
          <button
            id="strikeout"
            className="option-button format"
            onClick={() => handleButtonClick("strikeThrough")}
          >
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
          <button
            id="justifyLeft"
            className="option-button align"
            onClick={() => handleButtonClick("justifyLeft")}
          >
            <AlignLeft size={16} />
          </button>
          <button
            id="justifyCenter"
            className="option-button align"
            onClick={() => handleButtonClick("justifyCenter")}
          >
            <AlignCenter size={16} />
          </button>
          <button
            id="justifyRight"
            className="option-button align"
            onClick={() => handleButtonClick("justifyRight")}
          >
            <AlignRight size={16} />
          </button>
          <button
            id="justifyFull"
            className="option-button align"
            onClick={() => handleButtonClick("justifyFull")}
          >
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
        </div>
        <div
          id="text-input"
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
