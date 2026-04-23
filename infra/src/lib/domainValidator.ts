/**
 * Domain validation helpers.
 *
 * The custom-domain attach flow needs to answer three questions, each of
 * which is a DNS check and must be explicit about which resolvers it uses:
 *
 *   1. Does <hostname> already CNAME to our traffic target?
 *      (If yes, we can fast-forward from PENDING_DNS to VALIDATING.)
 *
 *   2. Has the ACM validation CNAME been created and propagated?
 *      (Answered by polling ACM directly; we do NOT second-guess ACM's
 *      own validation — we just surface its state to the wizard.)
 *
 *   3. Is <hostname> resolving globally or still stuck on stale records?
 *      (Multi-resolver check: Google 8.8.8.8 + Cloudflare 1.1.1.1 + default.)
 *
 * The original plan called these "live DNS lookups against Google and
 * Cloudflare using dns.resolveCname". This file makes those resolver
 * choices explicit (the original proposal used `dns.resolveCname` with
 * Node defaults, which is whatever the OS resolver is pointed at).
 *
 * Output is deliberately small and structured so the attach / check
 * handlers can set DOMAIN# state without re-doing any parsing.
 */

import dns from 'node:dns';
import { normalizeHostname } from '../../../services/domains';

export type ResolverName = 'google' | 'cloudflare' | 'system';

export type CnameLookupResult = {
  resolver: ResolverName;
  records: string[];
  error?: string;
};

export type DnsCheckResult = {
  hostname: string;
  expected: string;
  matches: boolean;
  perResolver: CnameLookupResult[];
};

const RESOLVER_SERVERS: Record<ResolverName, string[] | null> = {
  google: ['8.8.8.8', '8.8.4.4'],
  cloudflare: ['1.1.1.1', '1.0.0.1'],
  system: null,
};

async function resolveCnameWithResolver(
  hostname: string,
  resolver: ResolverName,
  timeoutMs = 3000,
): Promise<CnameLookupResult> {
  const inst = new dns.promises.Resolver({ timeout: timeoutMs, tries: 2 });
  const servers = RESOLVER_SERVERS[resolver];
  if (servers) inst.setServers(servers);

  try {
    const records = await inst.resolveCname(hostname);
    return { resolver, records };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { resolver, records: [], error: message };
  }
}

/**
 * Look up the CNAME for `hostname` across multiple public resolvers and
 * report which (if any) already point at `expected`.
 *
 * Matching is suffix-insensitive of trailing dots and case-insensitive;
 * CNAME targets are compared normalized (trailing `.` stripped, lower).
 */
export async function checkCnameMatches(params: {
  hostname: string;
  expected: string;
  resolvers?: ResolverName[];
  timeoutMs?: number;
}): Promise<DnsCheckResult> {
  const hostname = normalizeHostname(params.hostname);
  const expected = params.expected.trim().toLowerCase().replace(/\.$/, '');
  const resolvers = params.resolvers || ['google', 'cloudflare', 'system'];

  const results = await Promise.all(
    resolvers.map((r) => resolveCnameWithResolver(hostname, r, params.timeoutMs)),
  );

  const matches = results.some((r) =>
    r.records.some((rec) => rec.trim().toLowerCase().replace(/\.$/, '') === expected),
  );

  return { hostname, expected, matches, perResolver: results };
}

export const __test__ = {
  resolveCnameWithResolver,
};
