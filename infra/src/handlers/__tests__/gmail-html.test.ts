/**
 * @jest-environment node
 */

import { applyTracking, buildMime as buildHandlerMime } from '../gmail';
import { buildMime as buildScheduledMime } from '../../lib/gmailSend';

function decodeMime(raw: string) {
  return Buffer.from(raw, 'base64url').toString('utf8');
}

function decodeMimeBody(raw: string) {
  const mime = decodeMime(raw);
  const encodedBody = mime.split('\r\n\r\n')[1]?.replace(/\r\n/g, '') || '';
  return Buffer.from(encodedBody, 'base64').toString('utf8');
}

describe('gmail HTML preparation', () => {
  test('applyTracking does not double-wrap links or duplicate the open pixel', () => {
    const params = {
      agencyId: 'agency-1',
      clientId: 'client-1',
      recipientEmail: 'coach@example.com',
      agencyEmail: 'agency@example.com',
      trackingId: 'tracking-1',
    };

    const once = applyTracking('<p><a href="https://example.com/page">View profile</a></p>', params);
    const twice = applyTracking(once, params);

    expect((twice.match(/email-metrics\/open/g) || []).length).toBe(1);
    expect((twice.match(/href="https:\/\/api\.myrecruiteragency\.com\/r\?/g) || []).length).toBe(1);
    expect(twice).not.toContain('https://api.myrecruiteragency.com/r?d=https://api.myrecruiteragency.com/r?');
  });

  test('handler MIME output keeps normalized edited HTML in base64 body', () => {
    const html = `<p>Hello Coach,</p><p>att<span class="ql-cursor">\uFEFF</span>acking midfielder ${'x'.repeat(140)}</p>`;

    const raw = buildHandlerMime('Subject', html, 'coach@example.com');
    const mime = decodeMime(raw);
    const body = decodeMimeBody(raw);

    expect(mime).toContain('Content-Transfer-Encoding: base64');
    expect(mime.split('\r\n\r\n')[1]).toContain('\r\n');
    expect(body).toContain('attacking midfielder');
    expect(body).not.toContain('ql-cursor');
    expect(body).not.toContain('\uFEFF');
  });

  test('scheduled send MIME output matches the same normalized base64 transport shape', () => {
    const html = `<p>I am ac\u200Bademically ready ${'y'.repeat(140)}</p>`;

    const raw = buildScheduledMime('Subject', html, 'coach@example.com');
    const mime = decodeMime(raw);
    const body = decodeMimeBody(raw);

    expect(mime).toContain('Content-Transfer-Encoding: base64');
    expect(mime.split('\r\n\r\n')[1]).toContain('\r\n');
    expect(body).toContain('I am academically ready');
    expect(body).not.toContain('\u200B');
  });
});
