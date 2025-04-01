"use client";
import React,{useState,useRef} from 'react'
const ContentEditor=()=>{
  const [content,setContent]=useState("<p>Tell your story</P>");
  const editorRef=useRef<HTMLDivElement>(null);
  const handleInput=(e:React.FormEvent<HTMLDivElement>)=>{
    setContent(e.currentTarget.innerHTML);
  }
  return (
    <div contentEditable suppressContentEditableWarning={true} onInput={handleInput} ref={editorRef}  className="w-full h-full border p-4 min-h-[150px] bg-[#faf9f6] dark:bg-[#1e1e1e] text-[#1e1e1e] dark:text-[#faf9f6]">
        <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}



export default ContentEditor