import { normalizeEmailHtml } from '@/utils/emailHtml';

export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

/**
 * Read normalized HTML from a mounted Quill editor.
 * Pass the wrapper ref that contains `.ql-container` and the Quill class.
 */
export function readEditorHtml(
  containerRef: React.RefObject<HTMLDivElement | null>,
  QuillClass: any,
): string | null {
  if (!containerRef.current || typeof QuillClass?.find !== 'function') return null;
  const qlContainer = containerRef.current.querySelector('.ql-container');
  if (!qlContainer) return null;
  const quill = QuillClass.find(qlContainer as HTMLElement);
  const raw = quill?.root?.innerHTML;
  return typeof raw === 'string' ? normalizeEmailHtml(raw) : null;
}
