/**
 * @jest-environment node
 */

import {
  normalizeHostname,
  isReservedLabel,
  isInternalPilotHost,
  RESERVED_LABELS,
  HostnameNormalizeError,
} from '../domains';

describe('normalizeHostname', () => {
  it('trims, lowercases, and strips a trailing dot', () => {
    expect(normalizeHostname('  App.ACME.com.  ')).toBe('app.acme.com');
  });

  it('converts IDN to punycode', () => {
    const normalized = normalizeHostname('café.example.com');
    expect(normalized.startsWith('xn--')).toBe(true);
    expect(normalized.endsWith('.example.com')).toBe(true);
  });

  it('rejects an apex domain (two labels only)', () => {
    expect(() => normalizeHostname('acme.com')).toThrow(HostnameNormalizeError);
  });

  it('rejects a single label', () => {
    expect(() => normalizeHostname('localhost')).toThrow(HostnameNormalizeError);
  });

  it('rejects an empty or whitespace input', () => {
    expect(() => normalizeHostname('')).toThrow(HostnameNormalizeError);
    expect(() => normalizeHostname('   ')).toThrow(HostnameNormalizeError);
  });

  it('rejects invalid characters', () => {
    expect(() => normalizeHostname('bad host.acme.com')).toThrow(HostnameNormalizeError);
    expect(() => normalizeHostname('app$.acme.com')).toThrow(HostnameNormalizeError);
  });

  it('rejects reserved leading labels', () => {
    for (const reserved of RESERVED_LABELS) {
      expect(() => normalizeHostname(`${reserved}.acme.com`)).toThrow(HostnameNormalizeError);
    }
  });

  it('accepts a valid subdomain', () => {
    expect(normalizeHostname('app.acme.com')).toBe('app.acme.com');
    expect(normalizeHostname('careers.subsection.acme.co.uk')).toBe('careers.subsection.acme.co.uk');
  });
});

describe('isReservedLabel', () => {
  it('is case-insensitive', () => {
    expect(isReservedLabel('WWW')).toBe(true);
    expect(isReservedLabel('Api')).toBe(true);
  });
  it('rejects non-reserved labels', () => {
    expect(isReservedLabel('careers')).toBe(false);
    expect(isReservedLabel('app')).toBe(false);
  });
});

describe('isInternalPilotHost', () => {
  it('matches subdomains of myrecruiteragency.com', () => {
    expect(isInternalPilotHost('pilot1.myrecruiteragency.com')).toBe(true);
    expect(isInternalPilotHost('deep.nested.myrecruiteragency.com')).toBe(true);
  });

  it('does not match external hosts', () => {
    expect(isInternalPilotHost('app.acme.com')).toBe(false);
    expect(isInternalPilotHost('myrecruiteragency.co.uk')).toBe(false);
  });
});
