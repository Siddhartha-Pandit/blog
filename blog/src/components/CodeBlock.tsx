// blog\src\components\CodeBlock.tsx
import { useState } from 'react';
import { Copy } from 'lucide-react';
import type { ContentNode } from '@/types';

export function CodeBlock({ node }: { node: ContentNode }) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs?.language || 'text';
  const code = node.content?.[0]?.text || '';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 group">
      <div className="bg-[#2d2d2d] rounded-lg overflow-hidden shadow-xl">
        <div className="flex justify-between items-center px-4 py-1 bg-[#1a1a1a]">
          <span className="text-sm text-[#f5f5f5] font-mono">
            {language.toUpperCase()}
          </span>
          <button
            onClick={copyToClipboard}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#ffffff11] rounded"
            aria-label="Copy code"
          >
            <Copy size={18} className="text-[#f5f5f5]" />
          </button>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-[0.8rem] leading-relaxed">
            {code.split('\n').map((line, index) => (
              <div key={index} className="font-jetbrains text-[#f5f5f5]">
                {line}
              </div>
            ))}
          </code>
        </pre>
        {copied && (
          <div className="absolute top-3 right-12 text-sm text-green-400 bg-[#1a1a1a] px-2 py-1 rounded">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
}