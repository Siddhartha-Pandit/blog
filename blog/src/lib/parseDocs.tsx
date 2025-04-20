// lib/utils/parse-content.tsx
import React from "react";
import { ImageComponent } from "@/components/ImageComponent";
import { CodeBlock } from "@/components/CodeBlock";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { useState, useCallback } from "react";
import { Copy } from 'lucide-react';

type ContentNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: ContentNode[];
  marks?: { type: string; attrs?: Record<string, any> }[];
  text?: string;
};

export function parseDoc(content: ContentNode[]): React.ReactNode {
  return content.map((node, idx) => (
    <React.Fragment key={idx}>{renderNode(node)}</React.Fragment>
  ));
}

function renderContent(node: ContentNode): React.ReactNode {
  return (
    node.content?.map((child, idx) => (
      <React.Fragment key={idx}>{renderNode(child)}</React.Fragment>
    )) ?? null
  );
}

function renderNode(node: ContentNode): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p className="mb-4 text-gray-800 dark:text-gray-200">{renderContent(node)}</p>;

    case "heading":
      return renderHeading(node);

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 text-gray-600 dark:text-gray-300 mb-4">
          {renderContent(node)}
        </blockquote>
      );

    case "codeBlock":
      return <CodeBlock node={node} />;

    case "horizontalRule":
      return <hr className="my-4 border-t dark:border-gray-700" />;

    case "table":
      return renderTable(node);

    case "tableRow":
      return renderTableRow(node);

    case "tableHeader":
      return renderTableCell(node, true);

    case "tableCell":
      return renderTableCell(node, false);

    case "image":
      return (
        <div className="my-4 max-w-full overflow-hidden rounded-lg">
          <ImageComponent src={node.attrs?.src} />
        </div>
      );

    case "bulletList":
      return <ul className="list-disc pl-6 mb-4 text-gray-800 dark:text-gray-200">{renderContent(node)}</ul>;

    case "orderedList":
      return <ol className="list-decimal pl-6 mb-4 text-gray-800 dark:text-gray-200">{renderContent(node)}</ol>;

    case "listItem":
      return <li className="mb-2">{renderContent(node)}</li>;

    case "taskList":
      return <ul className="list-none pl-6 mb-4">{renderContent(node)}</ul>;

    case "taskItem":
      return (
        <li className="flex items-center mb-2 text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={node.attrs?.checked}
            disabled
            className="mr-2 h-4 w-4 accent-gray-800 dark:accent-gray-200"
          />
          {renderContent(node)}
        </li>
      );

    case "youtube":
      return (
        <div className="my-4 aspect-video max-w-full overflow-hidden rounded-lg">
          <YouTubeEmbed src={node.attrs?.src} />
        </div>
      );

    default:
      return renderText(node);
  }
}

function renderHeading(node: ContentNode): React.ReactNode {
  const level = node.attrs?.level ?? 1;
  const tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  return React.createElement(
    tag,
    { className: `mb-4 font-semibold text-gray-900 dark:text-gray-100 ${headingClasses[level] || ""}` },
    renderContent(node)
  );
}

const headingClasses: Record<number, string> = {
  1: "text-3xl md:text-4xl",
  2: "text-2xl md:text-3xl",
  3: "text-xl md:text-2xl",
  4: "text-lg md:text-xl",
};

function renderTable(node: ContentNode): React.ReactNode {
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border dark:border-gray-700">
      <table className="w-full border-collapse">
        <tbody>{renderContent(node)}</tbody>
      </table>
    </div>
  );
}

function renderTableRow(node: ContentNode): React.ReactNode {
  return <tr className="border-b dark:border-gray-700">{renderContent(node)}</tr>;
}

function renderTableCell(
  node: ContentNode,
  isHeader = false
): React.ReactNode {
  const tag = isHeader ? "th" : "td";
  return React.createElement(
    tag,
    { className: "p-2 md:p-3 text-left border-r dark:border-gray-700 last:border-r-0 text-gray-800 dark:text-gray-200" },
    renderContent(node)
  );
}

function renderText(node: ContentNode): React.ReactNode {
  if (!node.text) return null;

  let element: React.ReactNode = node.text;
  node.marks?.forEach((mark) => {
    switch (mark.type) {
      case "bold":
        element = <strong className="font-semibold">{element}</strong>;
        break;
      case "italic":
        element = <em className="italic">{element}</em>;
        break;
      case "underline":
        element = <u className="underline">{element}</u>;
        break;
      case "strike":
        element = <s className="line-through">{element}</s>;
        break;
      case "code":
        element = <CopyableInlineCode text={String(element)} />;
        break;
      case "link":
        element = (
            <a
              href={mark.attrs?.href}
              target={mark.attrs?.target}
              rel={mark.attrs?.rel}
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              {element}
            </a>
          );
        break;
      case "highlight":
        element = <mark className="bg-yellow-100 dark:bg-yellow-900/50">{element}</mark>;
        break;
      case "subscript":
        element = <sub className="align-sub text-sm">{element}</sub>;
        break;
      case "superscript":
        element = <sup className="align-super text-sm">{element}</sup>;
        break;
    }
  });

  return element;
}

function CopyableInlineCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no-op */
    }
  }, [text]);

  return (
    <span className="relative inline-flex items-center group/code">
      <code className="px-1.5 py-0.5 rounded bg-gray-800 dark:bg-gray-900 text-gray-100 dark:text-gray-200 text-sm font-mono">
        {text}
        <button
          onClick={onCopy}
          aria-label="Copy code"
          className="ml-1.5 p-1 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-500 rounded hover:bg-gray-700/50"
        >
          <Copy className="w-4 h-4 text-gray-300 dark:text-gray-400 hover:text-gray-100" />
        </button>
        {copied && (
          <span className="absolute -top-6 right-0 rounded bg-gray-700 px-2 py-1 text-xs text-gray-100">
            Copied!
          </span>
        )}
      </code>
    </span>
  );
}