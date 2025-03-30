interface Token {
    type: string;
    content?: string;
    items?: Token[];
    lang?: string;
    href?: string;
    alt?: string;
    align?: string[];
  }
  
  class CustomMarkdownParser {
    private static blockRules = [
        { regex: /^#{1,6} (.+)$/, type: 'heading' },
        { regex: /^> (.*)/, type: 'blockquote' },
        { regex: /^- \s*\[([xX]?)\] (.+)/, type: 'checkbox' },
        { regex: /^- +(.+)/, type: 'ul' },
        { regex: /^\d+\.\s+(.*)/, type: 'ol' },
        { regex: /^```(\w*)\n([\s\S]*?)\n```/, type: 'code' },
        { regex: /^\|(.+)\|\n\|(?:\s*:?[-]+:?\s*\|)+\n((?:\|.*\|\n?)*)/, type: 'table' },
        { regex: /^---/, type: 'hr' },
    ];

    private static inlineRules = [
        { regex: /\*\*(.*?)\*\*/g, type: 'strong' },
        { regex: /\*(.*?)\*/g, type: 'em' },
        { regex: /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/, type: 'image' },
        { regex: /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/, type: 'link' },
        { regex: /`(.*?)`/g, type: 'inlineCode' },
        { regex: /~~(.*?)~~/g, type: 'del' },
    ];
  
    static parse(markdown: string): Token[] {
      const tokens: Token[] = [];
      const lines = markdown.split('\n');
      let listStack: Token[] = [];
  
      while (lines.length) {
        let line = lines.shift()?.trim() || '';
  
        if (!line) {
          tokens.push({ type: 'br' });
          continue;
        }
  
        // Handle block elements
        let matched = false;
        for (const rule of this.blockRules) {
          const match = line.match(rule.regex);
          if (match) {
            matched = true;
            this.handleBlock(rule.type, match, tokens, listStack, lines);
            break;
          }
        }
  
        if (!matched) this.handleParagraph(line, tokens, listStack);
      }
  
      return tokens;
    }
  
    private static handleBlock(type: string, match: RegExpMatchArray, 
                              tokens: Token[], listStack: Token[], lines: string[]) {
      switch(type) {
        case 'code':
          tokens.push({
            type: 'code',
            content: match[2],
            lang: match[1]
          });
          break;
          
        case 'table':
          const [header, , ...rows] = match[0].split('\n');
          const align = match[0].split('\n')[1].split('|').slice(1, -1)
            .map(c => c.trim().replace(/^:?-+:?$/, m => 
              m.startsWith(':') ? 'left' : m.endsWith(':') ? 'right' : 'center'));
          
          tokens.push({
            type: 'table',
            items: [
              { type: 'thead', items: this.parseTableRow(header) },
              { type: 'tbody', items: rows.map(row => this.parseTableRow(row)) }
            ],
            align
          });
          break;
          
        // Other block type handlers
      }
    }
  
    private static parseTableRow(row: string): Token {
      return {
        type: 'tr',
        items: row.split('|').slice(1, -1).map(cell => ({
          type: 'td',
          content: this.parseInline(cell.trim())
        }))
      };
    }
  
    static parseInline(text: string): string | Token[] {
      let result: (string | Token)[] = [text];
      
      this.inlineRules.forEach(({ regex, type }) => {
        result = result.flatMap(node => {
          if (typeof node !== 'string') return [node];
          return node.split(regex).map(part => {
            const match = part.match(regex);
            return match ? { type, content: match[1], ...this.getProps(type, match) } : part;
          });
        });
      });
  
      return result;
    }
  
    private static getProps(type: string, match: RegExpMatchArray) {
      switch(type) {
        case 'image': return { alt: match[1], href: match[2] };
        case 'link': return { content: match[1], href: match[2] };
        default: return {};
      }
    }
  }