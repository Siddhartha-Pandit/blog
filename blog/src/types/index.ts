// types/index.ts
export type ContentNode = {
    type: string;
    attrs?: Record<string, any>;
    content?: ContentNode[];
    marks?: { type: string }[];
    text?: string;
  };