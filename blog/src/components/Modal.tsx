// src/components/Modal.tsx
import React, {
  useState,
  ReactNode,
  ChangeEvent,
  useEffect,
  useRef,
} from "react";
import { X } from "lucide-react";

export interface ModalTab {
  id: string;
  name: string;
  title?: string;
  content?: ReactNode;
  inputPlaceholders?: string[];
}

export interface ModalProps {
  modalTitle?: string;
  modalTextTitle?: string;
  inputPlaceholders?: string[];
  inputComponent?: ReactNode;
  customContent?: ReactNode;
  tabs?: ModalTab[];
  onOk?: (values: string[], activeTabIndex: number) => void;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({
  modalTitle,
  modalTextTitle,
  inputPlaceholders = [],
  inputComponent,
  customContent,
  tabs = [],
  onOk,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Retrieve the base input values either from the active tab or the default placeholders.
  const getBaseValues = (tabIndex: number) => {
    const base = tabs[tabIndex]?.inputPlaceholders || inputPlaceholders;
    return base.map(() => "");
  };

  // Initialize the input values.
  const [values, setValues] = useState<string[]>(() => getBaseValues(0));
  const backdropRef = useRef<HTMLDivElement>(null);

  // Only update the input values when the active tab changes.
  useEffect(() => {
    // When the tab changes, reset values to the new tab's defaults.
    setValues(getBaseValues(activeTab));
  }, [activeTab]);

  // Close the modal when clicking on the backdrop area (outside the panel).
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (backdropRef.current && e.target === backdropRef.current) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Update state when the input value changes.
  const handleChange = (idx: number) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => {
      const next = [...prev];
      next[idx] = e.target.value;
      return next;
    });
  };

  const handleOk = () => {
    onOk?.(values, activeTab);
  };

  const currentTab = tabs[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div ref={backdropRef} className="absolute inset-0 bg-black opacity-50" />

      {/* Modal Panel with classic design layout */}
      <div
        className="relative w-full max-w-md p-4 bg-[#faf9f6] text-[#1e1e1e]
                   border border-gray-300 rounded shadow-md dark:bg-[#1e1e1e]
                   dark:text-[#faf9f6] dark:border-gray-600"
      >
        {/* Header Section with Title and Close Button */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4">
          {modalTitle && (
            <h3 className="text-2xl font-semibold">{modalTitle}</h3>
          )}
          <button
            onClick={onClose}
            className="text-[#1e1e1e] dark:text-[#faf9f6] hover:opacity-75"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation (if tabs are provided) */}
        {tabs.length > 0 && (
          <div className="mb-4">
            <ul className="flex border-b">
              {tabs.map((tab, idx) => (
                <li
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`mr-4 pb-2 cursor-pointer ${
                    idx === activeTab
                      ? "border-b-2 border-gray-600 font-bold"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {tab.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Subtitle / Tab Title */}
        {(currentTab?.title || (tabs.length === 0 && modalTextTitle)) && (
          <h2 className="text-lg font-medium mb-2">
            {currentTab?.title || modalTextTitle}
          </h2>
        )}

        {/* Custom or Tab Content */}
        <div className="mb-4">
          {currentTab?.content || customContent}
        </div>

        {/* Inputs or Custom Input Component */}
        {inputComponent ? (
          inputComponent
        ) : (
          <div className="space-y-3 mb-4">
            {(currentTab?.inputPlaceholders || inputPlaceholders).map(
              (ph, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={ph}
                  value={values[idx] || ""}
                  onChange={handleChange(idx)}
                  className="w-full px-3 py-2 border border-gray-300 rounded
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             bg-[#faf9f6] text-[#1e1e1e] dark:bg-[#1e1e1e]
                             dark:text-[#faf9f6] dark:border-gray-600"
                />
              )
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded
                       text-[#1e1e1e] dark:text-[#faf9f6] dark:border-gray-600
                       hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleOk}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
