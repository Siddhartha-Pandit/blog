import React from 'react'
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react'

// Define your language options with explicit types
const LANGUAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c++', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'json', label: 'JSON' },
]

/**
 * We leverage TipTap’s built-in NodeViewProps instead of rolling our own `any` types,
 * so that `node` and `updateAttributes` are correctly typed. :contentReference[oaicite:0]{index=0}
 */
const CustomCodeBlockComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  // `node.attrs.language` is guaranteed to be a string here
  const language = node.attrs.language as string

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateAttributes({ language: e.target.value })
  }

  return (
    <NodeViewWrapper className="relative rounded-md my-4 bg-white dark:bg-gray-800">
      <select
        className="absolute top-0 right-0 bg-[#131313] px-1 py-0.5 text-xs rounded-bl-md shadow-sm focus:outline-none"
        value={language || 'javascript'}
        onChange={handleLanguageChange}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <pre className="pt-8 px-4 pb-4 min-h-[100px] overflow-auto font-mono text-sm text-gray-800 dark:text-gray-100">
        <NodeViewContent as="code" className={`language-${language}`} />
      </pre>
    </NodeViewWrapper>
  )
}

export default CustomCodeBlockComponent
