// components/CodeBlock.tsx
import { useState } from 'react';
import { Copy } from 'lucide-react'; // <-- lucide-react icon
// import type { ContentNode } from '../types'; 
import type { ContentNode } from '@/types';

export function CodeBlock({ node }: { node: ContentNode }) {
  const [copied, setCopied] = useState(false);
  const code = node.content?.[0]?.text || '';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block relative mb-4">
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${node.attrs?.language || 'text'}`}>
          {code}
        </code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-2 rounded hover:bg-gray-700 transition-colors"
        aria-label="Copy code"
      >
        <Copy size={18} className="text-gray-300" />
      </button>
      {copied && (
        <span className="absolute top-2 right-12 text-sm text-green-400">
          Copied!
        </span>
      )}
    </div>
  );
}
