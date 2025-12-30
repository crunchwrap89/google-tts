export const cleanMarkdown = (markdown: string): string => {
  let text = markdown;

  // Remove headers (e.g. # Title -> Title)
  text = text.replace(/^#+\s+/gm, '');

  // Remove images (e.g. ![alt](url) -> ) - we probably don't want to read image alt text as part of the flow usually, or maybe we do?
  // The user said "does not make sense being read out".
  // Usually reading "Image of ..." is annoying if it's just decorative.
  // But if it's "![Diagram of architecture](...)" it might be useful.
  // However, often in tutorials images are screenshots.
  // Let's remove images completely for now, or maybe just keep the alt text?
  // User said "parts of the markdown file that does not make sense being read out".
  // Remove images (e.g. ![alt](url) -> )
  text = text.replace(/!\[[^\]]*]\([^)]+\)/g, '');

  // Remove links (e.g. [text](url) -> text)
  text = text.replace(/\[([^\]]+)]\([^)]+\)/g, '$1');

  // Remove bold/italic (e.g. **text** -> text, *text* -> text)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/([*_])(.*?)\1/g, '$2');

  // Remove inline code (e.g. `code` -> code)
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove blockquotes (e.g. > text -> text)
  text = text.replace(/^>\s+/gm, '');

  // Remove list markers (e.g. - item -> item, 1. item -> item)
  text = text.replace(/^[\s\t]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s\t]*\d+\.\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^-{3,}/gm, '');

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  return text;
};

