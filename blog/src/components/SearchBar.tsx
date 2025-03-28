import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  onToggleChange?: (isOpen: boolean) => void;
};

export default function SearchBar({ onToggleChange }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent when open state changes
  useEffect(() => {
    if (onToggleChange) {
      onToggleChange(isOpen);
    }
  }, [isOpen, onToggleChange]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {isOpen ? (
        <div className="flex items-center border border-gray-300 rounded-full shadow-md overflow-hidden w-64 transition-all duration-300">
          <Search className="ml-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-2 py-1 w-full outline-none"
            autoFocus
            maxLength={18}
          />
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="mr-3 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <Search size={20} className="text-gray-600" />
        </button>
      )}
    </div>
  );
}
