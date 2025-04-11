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

  // Get the base input values from the active tab's placeholders or the default ones.
  const getBaseValues = (tabIndex: number) => {
    const base = tabs[tabIndex]?.inputPlaceholders || inputPlaceholders;
    return base.map(() => "");
  };

  // Initialize the input values.
  const [values, setValues] = useState<string[]>(() => getBaseValues(0));
  const backdropRef = useRef<HTMLDivElement>(null);

  // Update values when the active tab changes.
  useEffect(() => {
    const newValues = getBaseValues(activeTab);
    setValues((prev) => {
      if (
        prev.length !== newValues.length ||
        !prev.every((v, i) => v === newValues[i])
      ) {
        return newValues;
      }
      return prev;
    });
  }, [activeTab, tabs, inputPlaceholders]);

  // Close modal when clicking outside the panel.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (backdropRef.current && e.target === backdropRef.current) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

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

      {/* Modal Panel */}
      <div
        className="relative rounded-lg shadow-lg w-full max-w-md p-6
                   bg-[#faf9f6] text-[#1e1e1e] dark:bg-[#1e1e1e] dark:text-[#faf9f6]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:opacity-75
                     text-[#1e1e1e] dark:text-[#faf9f6]"
        >
          <X size={24} />
        </button>

        {/* Header */}
        {modalTitle && (
          <h2 className="text-2xl font-semibold mb-4">
            {modalTitle}
          </h2>
        )}

        {/* Tab Navigation (if tabs are provided) */}
        {tabs.length > 0 && (
          <div className="flex space-x-2 mb-4">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-md transition-colors focus:outline-none ${
                  idx === activeTab
                    ? "bg-gray-200 dark:bg-gray-700 text-[#1e1e1e] dark:text-[#faf9f6]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

        {/* Subtitle / Tab Title */}
        {(currentTab?.title || (tabs.length === 0 && modalTextTitle)) && (
          <h3 className="text-lg font-medium mb-2">
            {currentTab?.title || modalTextTitle}
          </h3>
        )}

        {/* Custom or Tab Content */}
        <div className="mb-4">
          {currentTab?.content || customContent}
        </div>

        {/* Inputs or Custom Input Component */}
        {inputComponent ? (
          inputComponent
        ) : (
          <div className="space-y-3">
            {(currentTab?.inputPlaceholders || inputPlaceholders).map(
              (ph, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={ph}
                  value={values[idx] || ""}
                  onChange={handleChange(idx)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500
                             bg-[#faf9f6] text-[#1e1e1e] dark:bg-[#1e1e1e] dark:text-[#faf9f6] dark:border-gray-600"
                />
              )
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border
                       border-gray-300 text-[#1e1e1e] dark:border-gray-500 dark:text-[#faf9f6]
                       hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleOk}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
