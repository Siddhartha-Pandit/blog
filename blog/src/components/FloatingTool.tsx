import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type FloatingToolItem = {
  id: string;
  type?: "item" | "separator";
  icon?: React.ReactElement;
  tooltip?: string;
  onClick?: () => void;
  dropdownItems?: FloatingToolItem[];
};

export type FloatingToolProps = {
  items: FloatingToolItem[];
  top?: string;
  left?: string;
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
        className="flex flex-row p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition justify-center items-center"
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
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition"
            >
              {subItem.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FloatingTool: React.FC<FloatingToolProps> = ({ items, top, left }) => {
  const toolRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: top ? parseInt(top) : window.innerHeight - 80,
    left: left ? parseInt(left) : window.innerWidth - 80,
  });

  useEffect(() => {
    const adjustPosition = () => {
      const tool = toolRef.current;
      if (tool) {
        const rect = tool.getBoundingClientRect();
        const padding = 10;
        let adjustedTop = position.top;
        let adjustedLeft = position.left;

        if (rect.bottom > window.innerHeight) {
          adjustedTop = window.innerHeight - rect.height - padding;
        } else if (rect.top < 0) {
          adjustedTop = padding;
        }

        if (rect.right > window.innerWidth) {
          adjustedLeft = window.innerWidth - rect.width - padding;
        } else if (rect.left < 0) {
          adjustedLeft = padding;
        }

        setPosition({ top: adjustedTop, left: adjustedLeft });
      }
    };

    adjustPosition();
    window.addEventListener("resize", adjustPosition);
    return () => {
      window.removeEventListener("resize", adjustPosition);
    };
  }, [position.top, position.left]);

  return (
    <div
      ref={toolRef}
      className="fixed z-50 bg-[#FAF9F6] dark:bg-[#1E1E1E] p-1 rounded-lg transition shadow-lg border border-neutral-200 dark:border-neutral-700"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="flex flex-row items-end space-x-1">
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

          return (
            <button
              key={`button-${item.id}`}
              onClick={item.onClick}
              title={item.tooltip}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition"
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
