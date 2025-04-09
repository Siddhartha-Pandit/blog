import React, { useState, useEffect, useRef } from "react";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

export type AddToolItem = {
  /** Unique identifier */
  id: string;
  /** Tooltip text */
  label: string;
  /** Icon element */
  icon: React.ReactElement;
  /** Click handler (for non‑dropdown items) */
  onClick?: () => void;
  /** Dropdown options, if any */
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
  // We'll stash refs here so we can detect outside clicks for each dropdown
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close any open dropdown if you click outside it
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <div className="fixed bottom-8 right-3 z-50">
      <div
        className={`
          flex flex-row-reverse items-center
          rounded-full shadow-lg
          overflow-visible      /* allow dropdown to show */
          transition-all duration-300 ease-in-out
          ${open ? "w-72" : ""}
          bg-[#FAF9F6] text-[#1E1E1E]
          dark:bg-[#1E1E1E] dark:text-[#FAF9F6]
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
          <div className="flex items-center gap-1 px-2">
            {tools.map((tool, idx) => {
              const hasDropdown = tool.dropdownItems?.length! > 0;
              const keyBase = `tool-${tool.id}-${idx}`;

              if (hasDropdown) {
                return (
                  <div
                    key={keyBase}
                    className="relative flex flex-col items-center"
                    ref={(el) => {
                      // Callback ref; we're storing the element in our ref object
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

                    {/* Dropdown items in grid layout:
                        Display only the icons in a grid with 2 rows.
                        The grid-flow-col class fills the first column first.
                        The gap and padding are reduced */}
                    {openDropdown === tool.id && (
                      <div
                        className={`
                          absolute bottom-full mb-2 z-60
                          grid grid-flow-col grid-rows-2 gap-0.5
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
                              w-10 h-10 rounded-md
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

              // Plain tool button if no dropdown is defined
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
