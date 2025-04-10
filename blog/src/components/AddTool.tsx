import React, { useState, useEffect, useRef } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

export type AddToolItem = {
  id: string;
  label: string;
  icon: React.ReactElement;
  onClick?: () => void;
  dropdownItems?: Array<{
    id: string;
    label: string;
    icon: React.ReactElement;
    onClick: () => void;
  }>;
};

export interface AddToolProps {
  /** Array of tools to show when expanded */
  tools?: AddToolItem[];
}

const AddTool: React.FC<AddToolProps> = ({ tools = [] }) => {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Refs to each dropdown wrapper so we can detect outside clicks
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close any open dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown]!.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <div className="fixed bottom-8 right-3 z-50">
      <div
        className={`
          flex flex-row-reverse items-center
          ${open ? "px-2" : ""}
          rounded-full shadow-lg
          transition-all duration-300 ease-in-out
          bg-[#FAF9F6] text-[#1E1E1E]
          dark:bg-[#1E1E1E] dark:text-[#FAF9F6]
          border border-neutral-200 dark:border-neutral-700
        `}
      >
        {/* Main + / X toggle */}
        <button
          onClick={() => {
            setOpen((v) => !v);
            setOpenDropdown(null);
          }}
          className={`
            p-2 rounded-full transition-colors duration-200 ease-in-out
            bg-[#FAF9F6] text-[#1E1E1E] hover:bg-[#E0E0E0]
            dark:bg-[#1E1E1E] dark:text-[#FAF9F6] dark:hover:bg-[#333]
            flex-shrink-0
          `}
          aria-label={open ? "Close tools" : "Open tools"}
        >
          {open ? <X size={16} /> : <Plus size={16} />}
        </button>

        {/* Tool buttons */}
        {open && (
          <div className="flex items-center gap-1">
            {tools.map((tool, idx) => {
              const hasDropdown = tool.dropdownItems?.length! > 0;
              const keyBase = `tool-${tool.id}-${idx}`;

              if (hasDropdown) {
                return (
                  <div
                    key={keyBase}
                    className="relative flex flex-col items-center"
                    ref={(el) => {
                      dropdownRefs.current[tool.id] = el;
                    }}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdown((cur) =>
                          cur === tool.id ? null : tool.id
                        )
                      }
                      title={tool.label}
                      className={`
                        flex items-center gap-1
                        p-2 rounded-full transition-colors duration-200 ease-in-out
                        bg-[#FAF9F6] text-[#1E1E1E] hover:bg-[#E0E0E0]
                        dark:bg-[#1E1E1E] dark:text-[#FAF9F6] dark:hover:bg-[#333]
                      `}
                    >
                      {tool.icon}
                      {openDropdown === tool.id ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>

                    {openDropdown === tool.id && (
                      <div
                        className={`
                          absolute bottom-full mb-0.5 z-60
                          grid grid-flow-col grid-rows-2
                          bg-[#FAF9F6] dark:bg-[#1E1E1E]
                          border border-neutral-200 dark:border-neutral-700
                          rounded-md shadow-lg p-0.5
                        `}
                      >
                        {tool.dropdownItems!.map((sub, subIdx) => (
                          <button
                            key={`sub-${tool.id}-${sub.id}-${subIdx}`}
                            onClick={() => {
                              sub.onClick();
                              setOpenDropdown(null);
                            }}
                            title={sub.label}
                            className={`
                              flex items-center justify-center
                              p-1.5 rounded-md
                              hover:bg-[#E0E0E0] dark:hover:bg-[#333]
                            `}
                          >
                            {sub.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Plain tool button
              return (
                <button
                  key={keyBase}
                  onClick={tool.onClick}
                  title={tool.label}
                  className={`
                    p-2 rounded-full transition-colors duration-200 ease-in-out
                    bg-[#FAF9F6] text-[#1E1E1E] hover:bg-[#E0E0E0]
                    dark:bg-[#1E1E1E] dark:text-[#FAF9F6] dark:hover:bg-[#333]
                  `}
                >
                  {tool.icon}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTool;
