// utils/mdConverter.ts

import type { JSONContent, Mark as TiptapMark } from '@tiptap/core';

/**
 * Convert a Tiptap JSONContent document into a Markdown string.
 */
export function convertToMarkdown(doc: JSONContent): string {
  if (!doc.content) return '';
  return doc.content.map(convertNode).join('\n\n');
}

function convertNode(node: JSONContent): string {
  switch (node.type) {
    case 'paragraph':
      return node.content ? node.content.map(convertNode).join('') : '';

    case 'text':
      return processText(node);

    case 'heading': {
      const level = node.attrs?.level ?? 1;
      const text = node.content ? node.content.map(convertNode).join('') : '';
      return `${'#'.repeat(level)} ${text}`;
    }

    case 'bulletList':
      return node.content
        ? node.content.map(child => convertListItem(child, '-')).join('\n')
        : '';

    case 'orderedList':
      return node.content
        ? node.content
            .map((child, idx) => convertListItem(child, `${idx + 1}.`))
            .join('\n')
        : '';

    case 'listItem':
      return node.content ? node.content.map(convertNode).join('') : '';

    case 'blockquote':
      return node.content
        ? node.content.map(convertNode).map(line => `> ${line}`).join('\n')
        : '';

    case 'codeBlock': {
      const lang = node.attrs?.language ?? '';
      const code = node.content ? node.content.map(convertNode).join('') : '';
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case 'image': {
      const src = node.attrs?.src ?? '';
      const alt = node.attrs?.alt ?? '';
      return `![${alt}](${src})`;
    }

    case 'youtube': {
      const src = node.attrs?.src ?? '';
      return `[youtube](${src})`;
    }

    case 'video': {
      const src = node.attrs?.src ?? '';
      return `![video](${src})`;
    }

    case 'link': {
      const href = node.attrs?.href ?? '';
      const text = node.content ? node.content.map(convertNode).join('') : '';
      return `[${text}](${href})`;
    }

    case 'taskList':
      return node.content ? node.content.map(convertNode).join('\n') : '';

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'x' : ' ';
      const text = node.content ? node.content.map(convertNode).join('') : '';
      return `- [${checked}] ${text}`;
    }

    case 'definitionList':
    case 'table':
    case 'tableRow':
    case 'tableCell':
    case 'tableHeader':
      return convertTableStructure(node);

    case 'horizontalRule':
      return '---';

    default:
      return node.content ? node.content.map(convertNode).join('') : '';
  }
}

function convertListItem(node: JSONContent, bullet: string): string {
  const content = node.content ? node.content.map(convertNode).join('') : '';
  return `${bullet} ${content}`;
}

function processText(node: JSONContent): string {
  let text = node.text ?? '';
  if (!node.marks) return text;

  for (const mark of node.marks as TiptapMark[]) {
    switch (mark.type) {
      case 'bold':
        text = `**${text}**`;
        break;
      case 'italic':
        text = `*${text}*`;
        break;
      case 'strike':
        text = `~~${text}~~`;
        break;
      case 'code':
        text = `\`${text}\``;
        break;
      case 'underline':
        text = `<u>${text}</u>`;
        break;
      case 'superscript':
        text = `<sup>${text}</sup>`;
        break;
      case 'subscript':
        text = `<sub>${text}</sub>`;
        break;
      case 'highlight':
        text = `==${text}==`;
        break;
    }
  }

  return text;
}

function convertTableStructure(node: JSONContent): string {
  if (node.type === 'table') {
    const rows = node.content ?? [];
    const lines: string[] = [];
    let headerCols = 0;

    for (const row of rows) {
      lines.push(convertTableStructure(row));
      if (row.content?.[0]?.type === 'tableHeader') {
        headerCols = row.content.length;
      }
    }

    if (headerCols > 0) {
      const separator = '| ' + Array(headerCols).fill('---').join(' | ') + ' |';
      lines.splice(1, 0, separator);
    }

    return lines.join('\n');
  }

  if (node.type === 'tableRow') {
    const cells = (node.content ?? []).map(c => convertTableStructure(c));
    return '| ' + cells.join(' | ') + ' |';
  }

  // tableCell or tableHeader
  const content = node.content ? node.content.map(convertNode).join('') : '';
  return content;
}
