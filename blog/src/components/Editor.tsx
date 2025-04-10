import React, { useState, useRef, useEffect } from 'react';
import "../../style.css";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Link from '@tiptap/extension-link';
import Code from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import { Markdown } from 'tiptap-markdown';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { all, createLowlight } from 'lowlight';

import FloatingTool, { FloatingToolItem } from './FloatingTool';
import AddTool, { AddToolItem } from './AddTool';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading as HeadingIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ListTree,
  ListOrdered,
  List as ListIcon,
  ListTodo,
  Ellipsis,
  Highlighter,
  Strikethrough,
  Superscript as SupIcon,
  Subscript as SubIcon,
  Code as CodeIcon,
  Regex,
  Link as LinkIcon,
  Image,
  Video,
  Table,
  Minus,
  Braces,
  CheckSquare,
  Quote,
  X, // close icon
} from 'lucide-react';

// Create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);

export default function Editor() {
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showSource, setShowSource] = useState(false);
  const [sourceType, setSourceType] = useState<'html' | 'markdown'>('html');
  const isMouseDownRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-10",
          },
        },
        orderedList: false,
        listItem: false,
        codeBlock: false, // disable default CodeBlock so we can use CodeBlockLowlight
      }),
      // Add CodeBlockLowlight with lowlight configuration
      CodeBlockLowlight.configure({ lowlight }),
      // Re‑add heading, lists, etc.
      Heading.configure({ levels: [1, 2, 3, 4] }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Code,             
      Underline,
      Strike,
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: { class: 'bg-yellow-200' },
      }),
      Superscript,
      Subscript,
      Link.configure({ openOnClick: false }),
      // Markdown extension added last
      Markdown.configure({ html: true }),
    ],
    content: `
        <p>
          That's a boring paragraph followed by a fenced code block:
        </p>
        <pre><code class="language-javascript">
        for (var i=1; i <= 20; i++)
        {
          if (i % 15 == 0)
            console.log("FizzBuzz");
          else if (i % 3 == 0)
            console.log("Fizz");
          else if (i % 5 == 0)
            console.log("Buzz");
          else
            console.log(i);
        }</code></pre>
        <p>
          Press Command/Ctrl + Enter to leave the fenced code block and continue typing in boring paragraphs.
        </p>
      `,
  });

  // Floating toolbar items (shown on text selection)
  const floatingItems: FloatingToolItem[] = [
    { id: 'bold', icon: <Bold size={16} />, tooltip: 'Bold', onClick: () => editor?.chain().focus().toggleBold().run() },
    { id: 'italic', icon: <Italic size={16} />, tooltip: 'Italic', onClick: () => editor?.chain().focus().toggleItalic().run() },
    { id: 'underline', icon: <UnderlineIcon size={16} />, tooltip: 'Underline', onClick: () => editor?.chain().focus().toggleUnderline().run() },
    { id: 'strikethrough', icon: <Strikethrough size={16} />, tooltip: 'Strikethrough', onClick: () => editor?.chain().focus().toggleStrike().run() },
    { id: 'separator1', type: 'separator' },
    {
      id: 'heading',
      icon: <HeadingIcon size={16} />,
      tooltip: 'Heading',
      dropdownItems: [
        { id: 'H1', icon: <Heading1 size={14} />, tooltip: 'H1', onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
        { id: 'H2', icon: <Heading2 size={14} />, tooltip: 'H2', onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
        { id: 'H3', icon: <Heading3 size={14} />, tooltip: 'H3', onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
        { id: 'H4', icon: <Heading4 size={14} />, tooltip: 'H4', onClick: () => editor?.chain().focus().toggleHeading({ level: 4 }).run() },
      ],
    },
    { id: 'separator2', type: 'separator' },
    {
      id: 'list',
      icon: <ListIcon size={16} />,
      tooltip: 'Lists',
      dropdownItems: [
        { id: 'UL', icon: <ListIcon size={14} />, tooltip: 'Unordered List', onClick: () => editor?.chain().focus().toggleBulletList().run() },
        { id: 'TL', icon: <ListTodo size={14} />, tooltip: 'Task List', onClick: () => alert('Add Task List extension!') },
        { id: 'OL', icon: <ListOrdered size={14} />, tooltip: 'Ordered List', onClick: () => editor?.chain().focus().toggleOrderedList().run() },
        { id: 'DL', icon: <ListTree size={14} />, tooltip: 'Definition List', onClick: () => alert('Definition List not built‑in') },
      ],
    },
    { id: 'separator3', type: 'separator' },
    {
      id: 'option',
      icon: <Ellipsis size={16} />,
      tooltip: 'Other tools',
      dropdownItems: [
        { id: 'highlighter', icon: <Highlighter size={14} />, tooltip: 'Highlight', onClick: () => editor?.chain().focus().toggleHighlight().run() },
        { id: 'superscript', icon: <SupIcon size={14} />, tooltip: 'Superscript', onClick: () => editor?.chain().focus().toggleSuperscript().run() },
        { id: 'subscript', icon: <SubIcon size={14} />, tooltip: 'Subscript', onClick: () => editor?.chain().focus().toggleSubscript().run() },
        { id: 'code', icon: <CodeIcon size={14} />, tooltip: 'Inline Code', onClick: () => editor?.chain().focus().toggleCode().run() },
        {
          id: 'link',
          icon: <LinkIcon size={14} />,
          tooltip: 'Link',
          onClick: () => {
            const url = prompt('Enter URL') || '';
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          },
        },
        { id: 'footnote', icon: <Regex size={14} />, tooltip: 'Footnote', onClick: () => alert('Footnote extension not configured') },
      ],
    },
  ];

  // Bottom toolbar (AddTool)
  const tools: AddToolItem[] = [
    {
      id: "image",
      label: "Image",
      icon: <Image size={16} />,
      onClick: () => {
        const src = prompt('Image URL') || '';
        if (src) editor?.chain().focus().setImage({ src }).run();
      },
    },
    {
      id: "video",
      label: "Video",
      icon: <Video size={16} />,
      onClick: () => {
        const src = prompt('Video URL') || '';
        if (src) editor?.chain().focus().setVideo({ src }).run();
      },
    },
    {
      id: "code-block",
      label: "Code block",
      icon: <Braces size={16} />,
      onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "table",
      label: "Table",
      icon: <Table size={16} />,
      onClick: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: "quote",
      label: "Blockquote",
      icon: <Quote size={16} />,
      onClick: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "list",
      label: "List",
      icon: <ListIcon size={16} />,
      dropdownItems: [
        { id: "bullet-list", label: "Bullet List", icon: <ListIcon size={14} />, onClick: () => editor?.chain().focus().toggleBulletList().run() },
        { id: "numbered-list", label: "Numbered List", icon: <ListOrdered size={14} />, onClick: () => editor?.chain().focus().toggleOrderedList().run() },
        { id: "checklist", label: "Checklist", icon: <CheckSquare size={14} />, onClick: () => alert('Checklist extension not added') },
      ],
    },
    {
      id: "divider",
      label: "Divider",
      icon: <Minus size={16} />,
      onClick: () => editor?.chain().focus().setHorizontalRule().run(),
    },
    {
      id: "view-source",
      label: "View Source",
      icon: <CodeIcon size={16} />,
      onClick: () => setShowSource(true),
    },
  ];

  // Floating toolbar positioning logic
  useEffect(() => {
    if (!editor) return;
    const updateFloating = () => {
      const { from, to } = editor.state.selection;
      if (from === to || isMouseDownRef.current) {
        setFloatingVisible(false);
        return;
      }
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 110,
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setFloatingVisible(true);
    };
    const handleMouseDown = () => {
      isMouseDownRef.current = true;
      setTimeout(() => (isMouseDownRef.current = false), 100);
    };
    editor.on('selectionUpdate', updateFloating);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      editor.off('selectionUpdate', updateFloating);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [editor]);

  return (
    <>
      <EditorContent editor={editor} />

      {floatingVisible && (
        <FloatingTool
          items={floatingItems}
          top={position.top}
          left={position.left}
          onMouseDown={e => e.preventDefault()}
        />
      )}

      <AddTool tools={tools} />
      <div className="flex gap-2">
        <button
          onClick={() => setSourceType('html')}
          className={`px-3 py-1 rounded ${sourceType === 'html' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          HTML
        </button>
        <button
          onClick={() => setSourceType('markdown')}
          className={`px-3 py-1 rounded ${sourceType === 'markdown' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        >
          Markdown
        </button>
      </div>
      {showSource && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-3/4 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setShowSource(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">
              {sourceType === 'html'
                ? editor?.getHTML()
                : editor?.storage.markdown.getMarkdown()}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
