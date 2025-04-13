// CustomCodeBlock.ts
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CustomCodeBlockComponent from '@/components/CustomCodeBlockComponent';
export const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CustomCodeBlockComponent);
  },
});
