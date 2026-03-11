import { normalizeEmailHtml } from '@/utils/emailHtml';

describe('normalizeEmailHtml', () => {
  test('removes Quill cursor spans and zero-width characters that can split words in emails', () => {
    const html = '<p>att<span class="ql-cursor">\uFEFF</span>ack&#8203;ing midfielder</p><p>I am ac\u200Bademically focused.</p>';

    expect(normalizeEmailHtml(html)).toBe('<p>attacking midfielder</p><p>I am academically focused.</p>');
  });

  test('collapses inter-tag whitespace without disturbing readable content', () => {
    const html = '<p>Hello Coach,</p>\n   <p>My name is Boaz.</p>';

    expect(normalizeEmailHtml(html)).toBe('<p>Hello Coach,</p><p>My name is Boaz.</p>');
  });

  test('strips <wbr> elements that cause mid-word breaks in email clients', () => {
    const html = '<p>Zimmer<wbr>man is a dedi<wbr/>cated soccer<wbr />player</p>';

    expect(normalizeEmailHtml(html)).toBe('<p>Zimmerman is a dedicated soccerplayer</p>');
  });

  test('strips soft hyphens (char and entity) that cause mid-word breaks', () => {
    const html = '<p>aca\u00ADdemically fo&shy;cused ath\u00ADlete</p>';

    expect(normalizeEmailHtml(html)).toBe('<p>academically focused athlete</p>');
  });

  test('removes ql-* CSS classes while preserving the element and other attributes', () => {
    const html = '<p class="ql-align-center">Centered text</p><a class="ql-link" href="https://example.com">link</a>';

    const result = normalizeEmailHtml(html);
    expect(result).toBe('<p>Centered text</p><a href="https://example.com">link</a>');
    expect(result).not.toContain('ql-');
  });

  test('removes empty span wrappers that Quill creates during formatting', () => {
    const html = '<p>Zimmer<span class="ql-size-normal"></span>man<span> </span>plays soccer</p>';

    expect(normalizeEmailHtml(html)).toBe('<p>Zimmerman plays soccer</p>');
  });

  test('preserves non-empty spans with real content', () => {
    const html = '<p>Hello <strong>Coach</strong>, I am <em>excited</em>.</p>';

    expect(normalizeEmailHtml(html)).toBe('<p>Hello <strong>Coach</strong>, I am <em>excited</em>.</p>');
  });

  test('preserves href attributes when stripping ql- classes from anchors', () => {
    const html = '<a class="ql-link" href="https://youtube.com/watch?v=abc">My highlights</a>';

    const result = normalizeEmailHtml(html);
    expect(result).toContain('href="https://youtube.com/watch?v=abc"');
    expect(result).not.toContain('ql-link');
  });

  test('is idempotent — running multiple times produces the same result', () => {
    const html = '<p class="ql-indent-1">Zimmer<wbr>man<span class="ql-cursor">\uFEFF</span> ath\u00ADlete</p>';

    const once = normalizeEmailHtml(html);
    const twice = normalizeEmailHtml(once);
    const thrice = normalizeEmailHtml(twice);
    expect(once).toBe(twice);
    expect(twice).toBe(thrice);
  });
});
