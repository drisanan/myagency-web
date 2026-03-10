const QL_CURSOR_SPAN_RE = /<span\b[^>]*class=(["'])[^"']*\bql-cursor\b[^"']*\1[^>]*>[\s\S]*?<\/span>/gi;
const ZERO_WIDTH_ENTITY_RE = /(?:&#8203;|&#8204;|&#8205;|&#65279;|&ZeroWidthSpace;)/gi;
const ZERO_WIDTH_CHAR_RE = /[\u200B-\u200D\uFEFF]/g;
const INTER_TAG_WHITESPACE_RE = />[\t\r\n ]+</g;

export function normalizeEmailHtml(html: string | null | undefined): string {
  if (!html) return '';

  return String(html)
    .replace(QL_CURSOR_SPAN_RE, '')
    .replace(ZERO_WIDTH_ENTITY_RE, '')
    .replace(ZERO_WIDTH_CHAR_RE, '')
    .replace(INTER_TAG_WHITESPACE_RE, '><')
    .trim();
}
