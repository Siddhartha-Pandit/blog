// lib/utils/parse-content.ts
import { Node as ProsemirrorNode } from 'prosemirror-model';

type ContentNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: ContentNode[];
  marks?: { type: string }[];
  text?: string;
};

export function parseProseMirrorContent(content: ContentNode[]) {
  return content.map(node => renderNode(node));
}

function renderNode(node: ContentNode): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p className="mb-4">{renderContent(node)}</p>;
    case 'heading':
      return renderHeading(node);
    case 'blockquote':
      return <blockquote className="border-l-4 border-gray-300 pl-4 text-gray-600 mb-4">{renderContent(node)}</blockquote>;
    case 'codeBlock':
      return <CodeBlock node={node} />;
    case 'horizontalRule':
      return <hr className="my-4 border-t" />;
    case 'table':
      return renderTable(node);
    case 'image':
      return <ImageComponent src={node.attrs?.src} />;
    case 'bulletList':
      return <ul className="list-disc pl-6 mb-4">{renderContent(node)}</ul>;
    case 'orderedList':
      return <ol className="list-decimal pl-6 mb-4">{renderContent(node)}</ol>;
    case 'listItem':
      return <li className="mb-2">{renderContent(node)}</li>;
    case 'taskList':
      return <ul className="list-none pl-6 mb-4">{renderContent(node)}</ul>;
    case 'taskItem':
      return (
        <li className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={node.attrs?.checked}
            className="mr-2"
            disabled
          />
          {renderContent(node)}
        </li>
      );
    case 'youtube':
      return <YouTubeEmbed src={node.attrs?.src} />;
    default:
      return renderText(node);
  }
}

function renderHeading(node: ContentNode) {
  const Tag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`mb-4 font-semibold ${headingClasses[node.attrs?.level || 1]}`}>
      {renderContent(node)}
    </Tag>
  );
}

const headingClasses = {
  1: 'text-4xl',
  2: 'text-3xl',
  3: 'text-2xl',
  4: 'text-xl',
};

function renderTable(node: ContentNode) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse">
        <tbody>{renderContent(node)}</tbody>
      </table>
    </div>
  );
}

function renderTableRow(node: ContentNode) {
  return <tr className="border-b">{renderContent(node)}</tr>;
}

function renderTableCell(node: ContentNode, isHeader = false) {
  const Tag = isHeader ? 'th' : 'td';
  return (
    <Tag className="p-2 text-left border-r last:border-r-0">
      {renderContent(node)}
    </Tag>
  );
}

function renderText(node: ContentNode) {
  if (!node.text) return null;
  
  let element: React.ReactNode = node.text;
  if (node.marks) {
    node.marks.forEach(mark => {
      switch (mark.type) {
        case 'bold':
          element = <strong>{element}</strong>;
          break;
        case 'italic':
          element = <em>{element}</em>;
          break;
        case 'underline':
          element = <u>{element}</u>;
          break;
        case 'strike':
          element = <s>{element}</s>;
          break;
        case 'code':
          element = <code className="inline-code">{element}</code>;
          break;
        case 'highlight':
          element = <mark className="bg-yellow-100">{element}</mark>;
          break;
        case 'subscript':
          element = <sub>{element}</sub>;
          break;
        case 'superscript':
          element = <sup>{element}</sup>;
          break;
      }
    });
  }
  return element;
}