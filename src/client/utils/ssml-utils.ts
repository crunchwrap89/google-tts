import { Segment } from "./markdown-parser";
import { cleanMarkdown } from "./markdown-cleaner";

export interface SsmlResult {
  ssml: string;
  codeBlocks: {
    language: string;
    content: string;
    duration: number;
  }[];
  captionText: string;
}

export const generateSsmlFromSegments = (segments: Segment[]): SsmlResult => {
  let ssml = '<speak><prosody>';
  let wordIndex = 0;
  const codeBlocks: {language: string, content: string, duration: number}[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment.type === 'text') {
      const cleaned = cleanMarkdown(segment.content);
      // Escape XML chars
      const escaped = cleaned
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

      const words = escaped.trim().split(/\s+/);
      const markedText = words
        .map((word) => {
            const w = `<mark name="word_${wordIndex}"/>${word}`;
            wordIndex++;
            return w;
        })
        .join(" ");
      ssml += `${markedText} `;
    } else {
      // Code block
      const duration = 4;
      ssml += `<mark name="code_${codeBlocks.length}_start"/> <break time="${duration}s"/> <mark name="code_${codeBlocks.length}_end"/> `;
      codeBlocks.push({
        language: segment.language,
        content: segment.content,
        duration: duration
      });
    }
  }
  ssml += '</prosody></speak>';

  const captionText = segments
      .filter(s => s.type === 'text')
      .map(s => cleanMarkdown(s.content))
      .join(' ');

  return {
    ssml,
    codeBlocks,
    captionText
  };
};

