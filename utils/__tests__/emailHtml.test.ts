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
});
