import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type FloatingToolItem = {
  id: string;
  type?: "item" | "separator";
  icon?: React.ReactElement;
  tooltip?: string;
  onClick?: () => void;
  dropdownItems?: FloatingToolItem[];
  inputType?: "number";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

export type FloatingToolProps = {
  items: FloatingToolItem[];
  top?: number;
  left?: number;
  onMouseDown?: (e: React.MouseEvent) => void; // Added missing prop
};

const FloatingToolDropdown: React.FC<{ item: FloatingToolItem }> = ({ item }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div ref={dropdownRef} className="relative flex flex-col items-start">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title={item.tooltip}
        className="flex flex-row p-[2px] hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition justify-center items-center"
      >
        {item.icon}
        {dropdownOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {dropdownOpen && (
        <div className="absolute top-full mt-1 grid grid-rows-2 grid-flow-col bg-[#FAF9F6] dark:bg-[#1E1E1E] shadow-md p-1 rounded-md w-fit z-50 gap-1 border border-neutral-200 dark:border-neutral-700">
          {item.dropdownItems?.map((subItem, index) => (
            <button
              key={`${item.id}-${subItem.id}-${index}`}
              onClick={() => {
                subItem.onClick?.();
                setDropdownOpen(false);
              }}
              title={subItem.tooltip}
              className="p-[2px] hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition"
            >
              {subItem.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FloatingTool: React.FC<FloatingToolProps> = ({ items, top = 0, left = 0, onMouseDown }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ top, left });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { width, height } = el.getBoundingClientRect();
    const padding = 8;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newLeft = left;
    let newTop = top;

    const halfWidth = width / 2;
    if (left - halfWidth < padding) {
      newLeft = padding + halfWidth;
    } else if (left + halfWidth > windowWidth - padding) {
      newLeft = windowWidth - halfWidth - padding;
    }

    const aboveTop = top - height;
    if (aboveTop < padding) {
      newTop = height + padding;
    }

    setAdjustedPos({ top: newTop, left: newLeft });
  }, [top, left, items]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[#FAF9F6] dark:bg-[#1E1E1E] p-1 rounded-xl transition shadow-xl border border-neutral-200 dark:border-neutral-700"
      style={{
        top: `${adjustedPos.top}px`,
        left: `${adjustedPos.left}px`,
        transform: "translate(-50%, -100%)",
      }}
      onMouseDown={onMouseDown} // Added mouse down handler
    >
      <div className="flex flex-row items-center space-x-[2px]">
        {items.map((item) => {
          if (item.type === "separator") {
            return (
              <div
                key={`separator-${item.id}`}
                className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1"
              />
            );
          }

          if (item.dropdownItems?.length) {
            return <FloatingToolDropdown key={`dropdown-${item.id}`} item={item} />;
          }

          if (item.inputType === "number") {
            return (
              <input
                key={`input-${item.id}`}
                type="number"
                {...item.inputProps}
                className="w-16 text-sm px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={item.tooltip}
              />
            );
          }

          return (
            <button
              key={`button-${item.id}`}
              onClick={item.onClick}
              title={item.tooltip}
              className="p-[2px] hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition"
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingTool;