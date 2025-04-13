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
import Youtube from '@tiptap/extension-youtube';
import Image from '@tiptap/extension-image';

import { Markdown } from 'tiptap-markdown';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { all, createLowlight } from 'lowlight';

import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'


import FloatingTool, { FloatingToolItem } from './FloatingTool';
import AddTool, { AddToolItem } from './AddTool';
import Modal from './Modal';
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
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Minus,
  Braces,
  CheckSquare,
  Quote,
  X
} from 'lucide-react';

import { Node, CommandProps } from '@tiptap/core';
import ImageUpload from './ImageUpload';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    definitionList: {
      toggleDefinitionList: () => ReturnType;
    };
  }
}

const DefinitionList = Node.create({
  name: 'definitionList',
  group: 'block',
  content: '(definitionTerm definitionDescription)+',
  parseHTML: () => [{ tag: 'dl' }],
  renderHTML: ({ HTMLAttributes }) => ['dl', HTMLAttributes, 0],
  addCommands() {
    return {
      toggleDefinitionList: () => (props: CommandProps) => {
        return props.commands.toggleWrap('definitionList');
      },
    };
  },
});

const DefinitionTerm = Node.create({
  name: 'definitionTerm',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'dt' }],
  renderHTML: ({ HTMLAttributes }) => ['dt', HTMLAttributes, 0],
});

const DefinitionDescription = Node.create({
  name: 'definitionDescription',
  group: 'block',
  content: 'block+',
  parseHTML: () => [{ tag: 'dd' }],
  renderHTML: ({ HTMLAttributes }) => ['dd', HTMLAttributes, 0],
});

const lowlight = createLowlight(all);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('javascript', js);
lowlight.register('typescript', ts);

export default function Editor() {
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [tableFloatingToolVisible,setTableFloatingToolVisible]=useState(false)
  const [tablePosition, setTablePosition] = useState({ top: 0, left: 0 });

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showSource, setShowSource] = useState(false);
  const [sourceType, setSourceType] = useState<'html' | 'markdown'>('html');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const isMouseDownRef = useRef(false);

  const [isModalImageOpen, setModalImageOpen] = useState<boolean>(false);
  const [isModalUrlOpen, setModalUrlOpen] = useState<boolean>(false);
  const [dragAndDropImage, setDragAndDropImage] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  // Convert a file into a base64 string
  const convertBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Convert file to base64 and update state
  const handleImageConvertToBase64 = async (file: File) => {
    try {
      const base64 = await convertBase64(file);
      setBase64Image(base64);
    } catch (error) {
      console.error("Error converting to base64:", error);
    }
  };

  // When a file is dragged and dropped, call conversion immediately
  const handleImageDragAndDrop = (file: File) => {
    setDragAndDropImage(file);
    handleImageConvertToBase64(file);
  };
  const resetImageStates=()=>{
    setDragAndDropImage(null);
    setBase64Image(null);
    const fileInput =document.querySelector('.file-input') as HTMLInputElement;
    if(fileInput) fileInput.value='';
  }
  

  const [isModalVideoUrlOpen, setModalVideoUrlOpen] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: { HTMLAttributes: { class: "list-disc ml-10" } },
        orderedList: false,
        listItem: false,
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem.configure({ nested: true }),
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
      Markdown.configure({ html: true }),
      Youtube.configure({ controls: true, nocookie: true }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
           class: 'w-[200px] h-[200px] border',
           'data-keep':true
           },
      }),
      // Custom definition list extensions
      DefinitionList,
      DefinitionTerm,
      DefinitionDescription,
      Table.configure({
        resizable:true,
      }),
      TableRow,
      TableHeader,
      TableCell,  
    ],
    content: 
    ` 
    
    `,
  });

  // Define floating toolbar items shown on text selection
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
        { id: 'TL', icon: <ListTodo size={14} />, tooltip: 'Task List', onClick: () => editor?.chain().focus().toggleTaskList().run() },
        { id: 'OL', icon: <ListOrdered size={14} />, tooltip: 'Ordered List', onClick: () => editor?.chain().focus().toggleOrderedList().run() },
        { id: 'DL', icon: <ListTree size={14} />, tooltip: 'Definition List', onClick: () => editor?.chain().focus().toggleDefinitionList().run() },
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
          onClick: () => setModalUrlOpen(true),
        },
        { id: 'footnote', icon: <Regex size={14} />, tooltip: 'Footnote', onClick: () => alert('Footnote extension not configured') },
      ],
    },
  ];
  const tableFloatingTool: FloatingToolItem[] = [
    {id:'addColumnBefore',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>add_column_left</span>, tooltip:"Add column before",onClick:()=>editor?.chain().focus().addColumnBefore().run()},
    {id:'addColumnAfter',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>add_column_right</span>, tooltip:"Add column after",onClick:()=>editor?.chain().focus().addColumnAfter().run()},
    {id:'deleteColumn',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>splitscreen_left</span>, tooltip:"Delete column",onClick:()=>editor?.chain().focus().deleteColumn().run()},
    {id:'addRowAbove',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>add_row_above</span>, tooltip:"Add row above",onClick:()=>editor?.chain().focus().addRowBefore().run()},
    {id:'addRowBelow',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>add_row_below</span>, tooltip:"Add row below",onClick:()=>editor?.chain().focus().addRowAfter().run()},
    {id:'deleteRow',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>splitscreen_bottom</span>, tooltip:"Delete row",onClick:()=>editor?.chain().focus().deleteRow().run()},
    {id:'deleteTable',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>delete</span>, tooltip:"Delete table",onClick:()=>editor?.chain().focus().deleteTable().run()},
    {id:'mergeOrSplit',icon:<span className="material-symbols-outlined icon-small" style={{fontSize:'14px'}}>combine_columns</span>, tooltip:"Split & Merge",onClick:()=>editor?.chain().focus().mergeOrSplit().run()},
];
// delete
  const tools: AddToolItem[] = [
    {
      id: "image",
      label: "Image",
      icon: <ImageIcon size={16} />,
      onClick: () => setModalImageOpen(true),
    },
    {
      id: "video",
      label: "Video",
      icon: <Video size={16} />,
      onClick: () => setModalVideoUrlOpen(true),
    },
    {
      id: "code-block",
      label: "Code block",
      icon: <Braces size={16} />,
      onClick: () => editor?.chain().focus().toggleCodeBlock({ language: selectedLanguage }).run(),
    },
    {
      id: "table",
      label: "Table",
      icon: <TableIcon size={16} />,
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

  const uploadImageModalData = [
    {
      id: "dragAndDrop",
      name: "Upload",
      title: "Drag & Drop",
      content: <ImageUpload onFileAccepted={handleImageDragAndDrop} />,
    },
    {
      id: "url",
      name: "URL",
      title: "Image URL",
      inputPlaceholders: ["Enter image URL"],
    },
  ];
  

  // When the modal OK is triggered, choose the base64 image if available; otherwise, use the manually entered URL.
  const handleImageModalOk = (values: string[], activeTabIndex: number) => {
    const url = values[0];
    const imageSrc = base64Image ? base64Image : url;

    if (imageSrc) {
      editor?.chain().focus().setImage({ src: imageSrc }).run();
    } else {
      console.error("No image source available.");
    }
    // Optionally, clear the base64 state after using it.
    setBase64Image(null);
    setDragAndDropImage(null);
    setModalImageOpen(false);
  };

  const handleModalImageClose = () => {
    // Optionally clear any stored base64 image when closing the modal
    setBase64Image(null);
    setModalImageOpen(false);
  };
    
  const handleUrlModalOk = (values: string[], activeTabIndex: number) => {
    const url = values[0];
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setModalUrlOpen(false);
  };

  const handleModalUrlClose = () => {
    setModalUrlOpen(false);
  };

  const handleVideoUrlModalOk = (values: string[], activeTabIndex: number) => {
    const url = values[0];
    if (url) {
      editor?.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
    setModalVideoUrlOpen(false);
  };

  const handleModalVideoUrlClose = () => {
    setModalVideoUrlOpen(false);
  };

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
  useEffect(() => {
    if (!editor) return;
    const updateTableFloating = () => {
      const { view, state } = editor;
      const { from } = state.selection;
      const dom = view.domAtPos(from);
      let node = dom.node as HTMLElement;
      // climb up to see if we’re in a <table>
      while (node && node.nodeName.toLowerCase() !== 'table' && node.parentElement) {
        node = node.parentElement;
      }
      if (node?.nodeName.toLowerCase() === 'table') {
        const rect = node.getBoundingClientRect();
        setTablePosition({
          top: rect.top + window.scrollY - 40,
          left: rect.left + window.scrollX,
        });
        setTableFloatingToolVisible(true);
      } else {
        setTableFloatingToolVisible(false);
      }
    };
    editor.on('selectionUpdate', updateTableFloating);
    return () => {
      editor.off('selectionUpdate', updateTableFloating);
    };
  }, [editor]);
  useEffect(() => {
    const handleResizeScroll = () => {
      if (!tableFloatingToolVisible || !editor) return;
      const { view, state } = editor;
      const { from } = state.selection;
      const dom = view.domAtPos(from);
      let node = dom.node as HTMLElement;
      while (node && node.nodeName.toLowerCase() !== 'table' && node.parentElement) {
        node = node.parentElement;
      }
      if (node?.nodeName.toLowerCase() === 'table') {
        const tableRect = node.getBoundingClientRect();
        setTablePosition({
          top: tableRect.top + window.scrollY - 40,
          left: tableRect.left + window.scrollX,
        });
      }
    };
    window.addEventListener('resize', handleResizeScroll);
    window.addEventListener('scroll', handleResizeScroll, true);
    return () => {
      window.removeEventListener('resize', handleResizeScroll);
      window.removeEventListener('scroll', handleResizeScroll, true);
    };
  }, [tableFloatingToolVisible, editor]);
 

  return (
    <div>
      {/* Editor Area */}
      <EditorContent editor={editor} />

      {/* Floating Toolbar */}
      {floatingVisible && (
        <FloatingTool
          items={floatingItems}
          top={position.top}
          left={position.left}
          onMouseDown={e => e.preventDefault()}
        />
      )}

      {/* Bottom Toolbar */}
      <AddTool tools={tools} />

      {/* Language Selector for Code Block */}
      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="language-select" style={{ marginRight: '0.5rem' }}>
          Select Code Block Language:
        </label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
        </select>
      </div>

      {/* Source View Toggler */}
      <div className="flex gap-2" style={{ marginTop: '1rem' }}>
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

      {isModalImageOpen && (
        <Modal
          modalTitle="Upload Image"
          tabs={uploadImageModalData}
          onOk={handleImageModalOk}
          onClose={handleModalImageClose}
        />
      )}
      {isModalUrlOpen && (
        <Modal
          modalTitle="Enter url"
          modalTextTitle="Enter url to add the link"
          inputPlaceholders={["url"]}
          onOk={handleUrlModalOk}
          onClose={handleModalUrlClose}
        />
      )}
      {isModalVideoUrlOpen && (
        <Modal
          modalTitle="Enter video url"
          modalTextTitle="Enter video url"
          inputPlaceholders={["video url"]}
          onOk={handleVideoUrlModalOk}
          onClose={handleModalVideoUrlClose}
        />
      )}
      {tableFloatingToolVisible && (
        <FloatingTool 
        items={tableFloatingTool}
        top={tablePosition.top}
        left={tablePosition.left}
        onMouseDown={e => e.preventDefault()}
        />
      )}
    </div>
  );
}
