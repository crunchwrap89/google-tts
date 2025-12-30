import { Buffer } from 'buffer';

if (typeof globalThis !== 'undefined' && typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

export type Segment =
  | { type: 'text'; content: string }
  | { type: 'code'; content: string; language: string };

export interface ParsedMarkdown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
  segments: Segment[];
}

export const parseMarkdown = async (markdown: string): Promise<ParsedMarkdown> => {
  let content = markdown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let metadata: Record<string, any> = {};

  // Manual frontmatter stripping to be robust against environment issues
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/;
  const fmMatch = frontmatterRegex.exec(markdown);

  if (fmMatch) {
    content = markdown.slice(fmMatch[0].length);
    // Try to parse metadata if needed
    try {
        const matter = (await import('gray-matter')).default;
        const result = matter(markdown);
        metadata = result.data;
    } catch (e) {
        console.warn("Failed to parse metadata", e);
    }
  } else {
      // Fallback to gray-matter
      try {
          const matter = (await import('gray-matter')).default;
          const result = matter(markdown);
          if (result.content !== markdown) {
              content = result.content;
              metadata = result.data;
          }
      } catch (e) {
          console.warn("gray-matter failed", e);
      }
  }

  const segments: Segment[] = [];
  // Regex for code blocks: ```lang? \n content ```
  // Handles \r\n and optional language
  const codeBlockRegex = /```(\w+)?\s*[\r\n]+([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index).trim();
      if (text) {
        segments.push({ type: 'text', content: text });
      }
    }

    // Add code block
    segments.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex).trim();
    if (text) {
      segments.push({ type: 'text', content: text });
    }
  }

  return {
    metadata,
    segments
  };
};
