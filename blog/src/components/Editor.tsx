import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FloatingTool, { FloatingToolItem } from './FloatingTool';
import { Bold, Italic, Underline,Heading,Heading1,Heading2,Heading3,Heading4, ListTree, ListOrdered,List,ListTodo,Ellipsis,Highlighter,Strikethrough,Superscript,Subscript,Code,Regex,Link,Braces} from 'lucide-react';

function Editor() {
  const floatingItems: FloatingToolItem[] = [
    {
      id: 'bold',
      icon: <Bold size={16} />,
      tooltip: 'Bold',
      onClick: () => {
        if(!editor) return;
        editor.commands.setContent(`<p>This is bold...</p>`)
      }
    },
    {
      id: 'italic',
      icon: <Italic size={16} />,
      tooltip: 'Italic',
      onClick: () => alert('italic clicked!'),
    },
    {
      id: 'underline',
      icon: <Underline size={16} />,
      tooltip: 'Underline',
      onClick: () => alert('underline clicked!'),
    },
    {
      id: "strikethrough",
      icon: <Strikethrough size={16} />,
      tooltip: "Strikethrough",
      onClick: () => alert("strikethrough clicked!"),
    },  
    {
      id: "separator1",
      type: "separator",
    },
    {
      id: "heading",
      icon: <Heading  size={16}/>,
      tooltip: "Heading",
      dropdownItems: [
        {
          id: "H1",
          icon: <Heading1 size={14} />,
          tooltip: "H1",
          onClick: () => alert("H1 clicked!"),
        },
        {
          id: "H3",
          icon: <Heading3 size={14} />,
          tooltip: "H2",
          onClick: () => alert("H3 clicked!"),
        },
        {
          id: "H2",
          icon: <Heading2 size={14} />,
          tooltip: "H2",
          onClick: () => alert("H2 clicked!"),
        },
       
        {
          id: "H4",
          icon: <Heading4 size={16} />,
          tooltip: "H4",
          onClick: () => alert("H4 clicked!"),
        },
        
      ],
    },
    {
      id: "separator2",
      type: "separator",
    },
    {
      id: "list",
      icon: <List  size={16}/>,
      tooltip: "Lists",
      dropdownItems: [
        {
          id: "UL",
          icon: <List size={14} />,
          tooltip: "UL",
          onClick: () => alert("H1 clicked!"),
        },
       
        {
          id: "DL",
          icon: <ListTree size={14} />,
          tooltip: "DL",
          onClick: () => alert("H3 clicked!"),
        },
        {
          id: "OL",
          icon: <ListOrdered size={14} />,
          tooltip: "OL",
          onClick: () => alert("H2 clicked!"),
        },
        {
          id: "TL",
          icon: <ListTodo size={14} />,
          tooltip: "TL",
          onClick: () => alert("H4 clicked!"),
        },
        
      ],
    },
    {
      id: "separator3",
      type: "separator",
    },
    {
      id: "option",
      icon: <Ellipsis  size={16}/>,
      tooltip: "Other tools",
      dropdownItems: [
        {
          id: "highlighter",
          icon: <Highlighter size={14} />,
          tooltip: "Highlighter",
          onClick: () => alert("highlighter clicked!"),
        },
        {
          id: "superscript",
          icon: <Superscript size={14} />,
          tooltip: "Superscript",
          onClick: () => alert("superscript clicked!"),
        },
        
        {
          id: "code",
          icon: <Code size={14} />,
          tooltip: "Code",
          onClick: () => alert("Code clicked!"),
        }, 
        {
          id: "subscript",
          icon: <Subscript size={14} />,
          tooltip: "Subscript",
          onClick: () => alert("subscript clicked!"),
        },
       
         {
          id: "link",
          icon: <Link size={14} />,
          tooltip: "Link",
          onClick: () => alert("link clicked!"),
        },
       
       
        {
          id: "footnote",
          icon: <Regex size={14} />,
          tooltip: "Footnote",
          onClick: () => alert("footnote clicked!"),
        },
       
      ],
    },
    
  ];

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p></p>',
  });

  return (
    <>
      <EditorContent editor={editor} />
      <FloatingTool items={floatingItems} top="200rem" left="20rem" />

    </>
  );
}

export default Editor;
