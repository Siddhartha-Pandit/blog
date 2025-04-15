import React, { useState, useRef, useEffect } from 'react';
import "../../style.css";
// 13131C (dark color) CCCCCC (light color)
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
import { all, createLowlight } from 'lowlight';

import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Placeholder from '@tiptap/extension-placeholder';
import Paragraph from '@tiptap/extension-paragraph'

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
  
} from 'lucide-react';

import { Node, CommandProps } from '@tiptap/core';
import ImageUpload from './ImageUpload';
import { CustomCodeBlock } from '@/lib/CustomCodeBlock';
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

export default function Editor() {
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [tableFloatingToolVisible, setTableFloatingToolVisible] = useState(false);
  const [imageFloatingToolVisible] = useState(false);
  // setImageFloatingToolVisible
  const [tablePosition, setTablePosition] = useState({ top: 0, left: 0 });
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [, setShowSource] = useState(false);
  // showSource
  const [selectedLanguage] = useState('javascript');
  // setSelectedLanguage
  const isMouseDownRef = useRef(false);

  const [isModalImageOpen, setModalImageOpen] = useState<boolean>(false);
  const [isModalUrlOpen, setModalUrlOpen] = useState<boolean>(false);
  const [, setDragAndDropImage] = useState<File | null>(null);
  // dragAndDropImage
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

  // const resetImageStates = () => {
  //   setDragAndDropImage(null);
  //   setBase64Image(null);
  //   const fileInput = document.querySelector('.file-input') as HTMLInputElement;
  //   if (fileInput) fileInput.value = '';
  // };

  const [isModalVideoUrlOpen, setModalVideoUrlOpen] = useState<boolean>(false);

  const textColor = 'text-[#333333] dark:text-[#dddddd]'

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: false,
      bulletList: { HTMLAttributes: { class: `list-disc ml-10 ${textColor}` } },
      orderedList: false,
      listItem: false,
      codeBlock: false,
    }),
    Placeholder.configure({
      placeholder: 'Write your story here...',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }),
    CustomCodeBlock.configure({
      lowlight,
      HTMLAttributes: { class: `p-4 rounded ${textColor}` },
    }),
    Heading.configure({
      levels: [1, 2, 3, 4],
      HTMLAttributes: { class: textColor },
    }),
    BulletList.configure({
      HTMLAttributes: { class: textColor },
    }),
    OrderedList.configure({
      HTMLAttributes: { class: textColor },
    }),
    ListItem.configure({
      HTMLAttributes: { class: textColor },
    }),
    TaskList.configure({
      HTMLAttributes: { class: textColor },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { class: textColor },
    }),
    Blockquote.configure({
      HTMLAttributes: { class: `border-l-4 pl-4 italic ${textColor}` },
    }),
    Code.configure({
      HTMLAttributes: {
        class: `bg-[#131313] dark:bg-[#131313] rounded px-1 ${textColor}`,
      },
    }),
    Underline.configure({
      HTMLAttributes: { class: `${textColor} underline` },
    }),
    Strike.configure({
      HTMLAttributes: { class: `${textColor} line-through` },
    }),
    Highlight.configure({
      multicolor: false,
      HTMLAttributes: { class: `bg-[#554D56] text-[#faf9f6] p-0.3 rounded-[1px] ${textColor}` },
    }),
    Superscript.configure({
      HTMLAttributes: { class: `${textColor} align-super` },
    }),
    Subscript.configure({
      HTMLAttributes: { class: `${textColor} align-sub` },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: `underline underline-offset-2 decoration-current ${textColor}`,
      },
    }),
    Youtube.configure({
      controls: true,
      nocookie: true,
      HTMLAttributes: { class: `block mx-auto w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] h-auto ${textColor}` },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: `mx-auto mx-auto w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] h-auto border ${textColor}`,
        'data-keep': true,
      },
    }),
    Paragraph,
    DefinitionList.configure({
      HTMLAttributes: { class: textColor },
    }),
    DefinitionTerm.configure({
      HTMLAttributes: { class: `${textColor} font-bold` },
    }),
    DefinitionDescription.configure({
      HTMLAttributes: { class: textColor },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: `table-auto border-collapse` },
    }),
    TableRow.configure({
      HTMLAttributes: { class: textColor },
    }),
    TableHeader.configure({
      HTMLAttributes: { class: `text-[#faf9f6] bg-[#1e1e1e] dark:text-[#1e1e1e] dark:bg-[#faf9f6] font-semibold border px-2 py-1` },
    }),
    TableCell.configure({
      HTMLAttributes: { class: `${textColor} border px-2 py-1` },
    }),
  ],
  content: '',
  editorProps: {
    attributes: {
      class: `prose ${textColor}`,
    },
  },
})
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
        { id: 'H3', icon: <Heading3 size={14} />, tooltip: 'H3', onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
        { id: 'H2', icon: <Heading2 size={14} />, tooltip: 'H2', onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
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
        { id: 'code', icon: <CodeIcon size={14} />, tooltip: 'Inline Code', onClick: () => {
          // editor?.chain().focus().toggleCode().run()
          editor?.chain()
          .focus()
          .setParagraph()  // new line
          .toggleCode()       // enable inline code mark
          .setParagraph() 
          .run()
        } },
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
    { id: 'addColumnBefore', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>add_column_left</span>, tooltip: "Add column before", onClick: () => editor?.chain().focus().addColumnBefore().run() },
    { id: 'addColumnAfter', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>add_column_right</span>, tooltip: "Add column after", onClick: () => editor?.chain().focus().addColumnAfter().run() },
    { id: 'deleteColumn', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>splitscreen_left</span>, tooltip: "Delete column", onClick: () => editor?.chain().focus().deleteColumn().run() },
    { id: 'addRowAbove', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>add_row_above</span>, tooltip: "Add row above", onClick: () => editor?.chain().focus().addRowBefore().run() },
    { id: 'addRowBelow', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>add_row_below</span>, tooltip: "Add row below", onClick: () => editor?.chain().focus().addRowAfter().run() },
    { id: 'deleteRow', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>splitscreen_bottom</span>, tooltip: "Delete row", onClick: () => editor?.chain().focus().deleteRow().run() },
    { id: 'deleteTable', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>delete</span>, tooltip: "Delete table", onClick: () => editor?.chain().focus().deleteTable().run() },
    { id: 'mergeOrSplit', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '14px' }}>combine_columns</span>, tooltip: "Split & Merge", onClick: () => editor?.chain().focus().mergeOrSplit().run() },
  ];
  const imageWidthFloatingTool: FloatingToolItem[] = [
    { id: 'normalWidth', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '20px' }}>width_normal</span>, tooltip: "Add column before", onClick: () => editor?.chain().focus().addColumnBefore().run() },
    { id: 'mediumWidth', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '20px' }}>width_wide</span>, tooltip: "Add column after", onClick: () => editor?.chain().focus().addColumnAfter().run() },
    { id: 'fullWidth', icon: <span className="material-symbols-outlined icon-small" style={{ fontSize: '20px' }}>width_full</span>, tooltip: "Delete column", onClick: () => editor?.chain().focus().deleteColumn().run() },
  ];

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
      onClick: () => editor?.chain().focus().insertContent('<p></p>').toggleCodeBlock({ language: selectedLanguage }).run(),
    },
    {
      id: "table",
      label: "Table",
      icon: <TableIcon size={16} />,
      onClick: () => {

        editor?.chain().focus()
        .insertContent('<p></p>')
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .insertContent('<p></p>')
        .run()
      }
    },
    {
      id: "quote",
      label: "Blockquote",
      icon: <Quote size={16} />,
      onClick: () => editor?.chain().focus().insertContent('<p></p>').toggleBlockquote().run(),
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

  const handleImageModalOk = (values: string[]) => {
    const url = values[0];
    const imageSrc = base64Image ? base64Image : url;

    if (imageSrc) {
      editor?.chain().focus().setImage({ src: imageSrc }).run();
    } else {
      console.error("No image source available.");
    }
    setBase64Image(null);
    setDragAndDropImage(null);
    setModalImageOpen(false);
  };

  const handleModalImageClose = () => {
    setBase64Image(null);
    setModalImageOpen(false);
  };

  const handleUrlModalOk = (values: string[]) => {
    const url = values[0];
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setModalUrlOpen(false);
  };

  const handleModalUrlClose = () => {
    setModalUrlOpen(false);
  };

  const handleVideoUrlModalOk = (values: string[]) => {
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
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#1e1e1e]">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border-b-2 border-transparent rounded-md text-4xl focus:outline-none focus:border-[#d1d1d1] dark:focus:border-[#525252]"
        />
      </div>

      <EditorContent editor={editor} />

      {floatingVisible && (
        <FloatingTool
          items={floatingItems}
          top={position.top}
          left={position.left}
          onMouseDown={e => e.preventDefault()}
        />
      )}
      
      {imageFloatingToolVisible && <FloatingTool 
        items={imageWidthFloatingTool}
        onMouseDown={e => e.preventDefault()}

      />}
      {/* Bottom Toolbar */}
      <AddTool tools={tools} />

     
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
