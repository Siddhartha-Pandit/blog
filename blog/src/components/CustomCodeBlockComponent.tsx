// CustomCodeBlockComponent.tsx
import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

const LANGUAGE_OPTIONS = [
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

interface CustomCodeBlockComponentProps {
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
}

const CustomCodeBlockComponent: React.FC<CustomCodeBlockComponentProps> = ({
  node,
  updateAttributes,
}) => {
  const { language } = node.attrs

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateAttributes({ language: e.target.value })
  }

  return (
    <NodeViewWrapper className="relative rounded-md my-4 bg-white dark:bg-gray-800">
      <select
        className="absolute top-0 right-0 bg-white dark:bg-gray-800 px-1 py-0.5 text-xs rounded-bl-md shadow-sm focus:outline-none"
        value={language || 'javascript'}
        onChange={handleLanguageChange}
      >
        {LANGUAGE_OPTIONS.map(option => (
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
