// import { useEffect, useMemo } from 'react';
// import Prism from 'prismjs';
// import 'prismjs/themes/prism.css';
// import 'prismjs/components/prism-jsx';

// interface MarkdownRendererProps {
//   children: string;
// }

// const MarkdownRenderer = ({ children }: MarkdownRendererProps) => {
//   const parsed = useMemo(() => CustomMarkdownParser.parse(children), [children]);

//   useEffect(() => Prism.highlightAll(), [parsed]);

//   const renderContent = (content: string | Token[]) => {
//     if (typeof content === 'string') return content;
//     return content.map(renderToken);
//   };

//   const renderToken = (token: Token, index: number) => {
//     switch(token.type) {
//       case 'h1': return <h1 key={index}>{renderContent(token.content)}</h1>;
//       case 'h2': return <h2 key={index}>{renderContent(token.content)}</h2>;
//       case 'strong': return <strong key={index}>{renderContent(token.content)}</strong>;
//       case 'em': return <em key={index}>{renderContent(token.content)}</em>;
//       case 'code':
//         return (
//           <pre key={index}>
//             <code className={`language-${token.lang}`}>
//               {token.content}
//             </code>
//           </pre>
//         );

//       case 'table':
//         return (
//           <table key={index} className="md-table">
//             <thead>{token.items?.[0].items?.map(renderToken)}</thead>
//             <tbody>{token.items?.[1].items?.map(renderToken)}</tbody>
//           </table>
//         );

//       case 'tr':
//         return <tr key={index}>{token.items?.map(renderToken)}</tr>;

//       case 'td':
//         return (
//           <td key={index} style={{ textAlign: token.align }}>
//             {renderContent(token.content)}
//           </td>
//         );

//       // Add other element handlers

//       default: return <span key={index}>{renderContent(token.content)}</span>;
//     }
//   };

//   return <div className="md-renderer">{parsed.map(renderToken)}</div>;
// };