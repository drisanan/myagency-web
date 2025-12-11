import { toBase64Url } from '../../app/api/gmail/utils';

describe('toBase64Url', () => {
  it('encodes simple string to base64url without padding', () => {
    const input = 'hello world';
    const encoded = toBase64Url(input);
    // base64 for 'hello world' is 'aGVsbG8gd29ybGQ=' -> base64url removes '='
    expect(encoded).toBe('aGVsbG8gd29ybGQ');
  });

  it('replaces + and / with - and _', () => {
    const input = '\u00ff\u00fe\u00fd'; // bytes likely to produce + or / in base64
    const encoded = toBase64Url(input);
    expect(encoded).not.toMatch(/[+/=]/);
  });
});


