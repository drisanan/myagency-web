import { __test__ } from '../cloudfrontEdge';

describe('cloudfrontEdge config transforms', () => {
  const base = {
    Aliases: { Quantity: 1, Items: ['old.example.com'] },
    ViewerCertificate: {
      ACMCertificateArn: 'arn:old',
      SSLSupportMethod: 'sni-only',
      MinimumProtocolVersion: 'TLSv1.2_2021',
      Certificate: 'arn:old',
      CertificateSource: 'acm',
    },
    Comment: 'x',
    CallerReference: 'ref',
    DefaultCacheBehavior: {} as any,
    Origins: { Quantity: 0, Items: [] as any[] },
    Enabled: true,
  } as any;

  it('addAliasAndCert adds hostname and swaps cert', () => {
    const out = __test__.addAliasAndCert(base, 'app.acme.com', 'arn:new');
    expect(out.Aliases?.Items).toEqual(
      expect.arrayContaining(['old.example.com', 'app.acme.com']),
    );
    expect(out.Aliases?.Quantity).toBe(2);
    expect(out.ViewerCertificate?.ACMCertificateArn).toBe('arn:new');
    expect(base.Aliases?.Items).toEqual(['old.example.com']);
  });

  it('addAliasAndCert is idempotent for existing alias', () => {
    const first = __test__.addAliasAndCert(base, 'app.acme.com', 'arn:new');
    const second = __test__.addAliasAndCert(first, 'app.acme.com', 'arn:new');
    expect(second.Aliases?.Quantity).toBe(2);
  });

  it('removeAlias drops the hostname and decrements quantity', () => {
    const withTwo = __test__.addAliasAndCert(base, 'app.acme.com', 'arn:new');
    const out = __test__.removeAlias(withTwo, 'app.acme.com');
    expect(out.Aliases?.Items).toEqual(['old.example.com']);
    expect(out.Aliases?.Quantity).toBe(1);
  });

  it('removeAlias is a no-op when alias not present', () => {
    const out = __test__.removeAlias(base, 'nothere.example.com');
    expect(out.Aliases?.Items).toEqual(['old.example.com']);
  });
});
