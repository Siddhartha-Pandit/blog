"use client";

import React, { useRef, useState, useEffect } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { IconPicker } from "./icon-picker";
import { Button } from "@/components/ui/button";
import { X, Smile, ImageIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextAreaAutosize from "react-textarea-autosize";
import { useCoverImage } from "@/hooks/use-cover-image";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  // use an explicit HTMLTextAreaElement ref so we can move the caret
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title ?? "");

  const update = useMutation(api.document.update);
  const removeIcon = useMutation(api.document.removeIcon);
    const coverImage =useCoverImage()
  // sync value when prop changes (but NOT when editing)
  useEffect(() => {
    if (!isEditing) {
      setValue(initialData.title ?? "");
    }
  }, [initialData.title, isEditing]);

  // Enable editing and focus textarea, then move caret to the end.
  const enableInput = () => {
    if (preview) return;
    setIsEditing(true);

    // Wait for textarea to mount & autosize to finish layout,
    // then focus & set caret to end. Two RAFs are reliable across browsers.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          const len = el.value.length;
          el.focus();
          // put caret at the end
          try {
            el.setSelectionRange(len, len);
          } catch {
            // fallback: set selectionStart/End
            el.selectionStart = el.selectionEnd = len;
          }
        }
      });
    });
  };

  // When editing finishes, persist only if changed.
  const disableInput = async () => {
    setIsEditing(false);
    if (value !== initialData.title) {
      try {
        await update({
          id: initialData._id,
          title: value || "Untitled",
        });
      } catch (err) {
        console.error("Failed to update title:", err);
      }
    }
  };

  // local change only; don't call server on each keystroke
  const onInput = (val: string) => {
    setValue(val);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void disableInput();
    }
  };

  const onIconSelect = async (icon: string) => {
    try {
      await update({
        id: initialData._id,
        icon,
      });
    } catch (error) {
      console.error("Failed to update icon:", error);
    }
  };

  const onRemoveIcon = async () => {
    try {
      await removeIcon({
        id: initialData._id,
      });
    } catch (err) {
      console.error("Failed to remove icon:", err);
    }
  };

  return (
    <div>
      <div className="pl-[54px] group relative">
        {/* ICON SECTION */}
        {!!initialData.icon && !preview && (
          <div className="flex items-center gap-x-2 group/icon pt-6">
            <IconPicker onChange={onIconSelect}>
              <p className="text-6xl hover:opacity-75 transition">
                {initialData.icon}
              </p>
            </IconPicker>

            <Button
              onClick={onRemoveIcon}
              className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
              variant="outline"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!!initialData.icon && preview && (
          <p className="text-6xl pt-6">{initialData.icon}</p>
        )}

        {/* ACTION BUTTONS */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
          {!initialData.icon && !preview && (
            <IconPicker onChange={onIconSelect}>
              <Button
                className="text-muted-foreground text-xs"
                variant="outline"
                size="sm"
              >
                <Smile className="h-4 w-4 mr-2" />
                Add icon
              </Button>
            </IconPicker>
          )}

          {!initialData.coverImage && !preview && (
            <Button
              onClick={coverImage.onOpen}
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add cover
            </Button>
          )}
        </div>
      </div>

      {/* TITLE / TEXTAREA */}
      {isEditing && !preview ? (
        <TextAreaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3f3f3f] dark:text-[#cfcfcf] resize-none"
        />
      ) : (
        <div
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3f3f3f] dark:text-[#cfcfcf]"
          onClick={enableInput}
        >
          {value || "Untitled"}
        </div>
      )}
    </div>
  );
};
