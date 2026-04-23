/**
 * CloudFront adapter for attach / detach of customer aliases on the
 * shared white-label distribution.
 *
 * All mutations are read-modify-write via GetDistributionConfig +
 * UpdateDistribution, gated by the returned ETag. This avoids clobbering
 * concurrent edits and gives us natural optimistic concurrency.
 *
 * The handler wrapping this library (domains-attach / domains-remove)
 * is responsible for:
 *   - persisting certArn on DOMAIN# before calling attachAlias
 *   - serializing attach/detach operations per distribution
 *   - handling `InProgress` UpdateDistribution responses with retries
 */

import {
  CloudFrontClient,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
  type DistributionConfig,
} from '@aws-sdk/client-cloudfront';

let _client: CloudFrontClient | null = null;

function client(): CloudFrontClient {
  if (!_client) {
    _client = new CloudFrontClient({ region: process.env.CLOUDFRONT_REGION || 'us-east-1' });
  }
  return _client;
}

export function __setCloudFrontClient(c: CloudFrontClient | null) {
  _client = c;
}

function cloneConfig(config: DistributionConfig): DistributionConfig {
  return JSON.parse(JSON.stringify(config)) as DistributionConfig;
}

function addAliasAndCert(config: DistributionConfig, hostname: string, certArn: string) {
  const next: DistributionConfig = cloneConfig(config);

  const items = new Set(next.Aliases?.Items || []);
  items.add(hostname);
  next.Aliases = {
    Quantity: items.size,
    Items: Array.from(items),
  };

  next.ViewerCertificate = {
    ACMCertificateArn: certArn,
    SSLSupportMethod: 'sni-only',
    MinimumProtocolVersion: 'TLSv1.2_2021',
    Certificate: certArn,
    CertificateSource: 'acm',
  };

  return next;
}

function removeAlias(config: DistributionConfig, hostname: string) {
  const next: DistributionConfig = cloneConfig(config);
  const items = (next.Aliases?.Items || []).filter((h) => h !== hostname);
  next.Aliases = { Quantity: items.length, Items: items };
  return next;
}

export async function attachAliasToDistribution(params: {
  distributionId: string;
  hostname: string;
  certArn: string;
}): Promise<void> {
  const cur = await client().send(
    new GetDistributionConfigCommand({ Id: params.distributionId }),
  );
  if (!cur.DistributionConfig || !cur.ETag) {
    throw new Error('GetDistributionConfig returned empty config/ETag');
  }
  const next = addAliasAndCert(cur.DistributionConfig, params.hostname, params.certArn);
  await client().send(
    new UpdateDistributionCommand({
      Id: params.distributionId,
      IfMatch: cur.ETag,
      DistributionConfig: next,
    }),
  );
}

export async function detachAliasFromDistribution(params: {
  distributionId: string;
  hostname: string;
}): Promise<void> {
  const cur = await client().send(
    new GetDistributionConfigCommand({ Id: params.distributionId }),
  );
  if (!cur.DistributionConfig || !cur.ETag) {
    throw new Error('GetDistributionConfig returned empty config/ETag');
  }
  const next = removeAlias(cur.DistributionConfig, params.hostname);
  await client().send(
    new UpdateDistributionCommand({
      Id: params.distributionId,
      IfMatch: cur.ETag,
      DistributionConfig: next,
    }),
  );
}

export const __test__ = { addAliasAndCert, removeAlias };
