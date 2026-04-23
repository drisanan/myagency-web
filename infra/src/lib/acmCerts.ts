/**
 * ACM certificate lifecycle, scoped to the white-label custom-domain flow.
 *
 * Conventions:
 *   - All certs live in us-east-1 (required by CloudFront).
 *   - One cert per hostname in v1; no SAN sharing yet. (We will revisit
 *     when the shared-distribution SAN list is introduced in Phase 5c.)
 *   - Tags carry agencyId + hostname so operator queries can fan back out
 *     from a cert ARN to tenancy metadata.
 *
 * Callers are expected to persist the returned `certArn` on the DOMAIN#
 * row so the check / remove handlers can act on it later.
 */

import {
  ACMClient,
  DeleteCertificateCommand,
  DescribeCertificateCommand,
  RequestCertificateCommand,
  type CertificateDetail,
  type DomainValidation,
} from '@aws-sdk/client-acm';

const ACM_REGION = process.env.ACM_REGION || 'us-east-1';

let _client: ACMClient | null = null;

function client(): ACMClient {
  if (!_client) _client = new ACMClient({ region: ACM_REGION });
  return _client;
}

/** For tests: inject a mock ACM client. */
export function __setAcmClient(c: ACMClient | null) {
  _client = c;
}

export type IssuedCertificate = {
  certArn: string;
  hostname: string;
};

export type CertificateValidationView = {
  certArn: string;
  status: CertificateDetail['Status'];
  validationRecord?: { name: string; value: string; type: 'CNAME' };
  domainValidationStatus?: DomainValidation['ValidationStatus'];
  notAfter?: Date;
};

/**
 * Request a DNS-validated cert for exactly one hostname. Idempotent from
 * the caller's perspective: the returned certArn is stable across retries
 * as long as the caller checks DOMAIN#.certArn first.
 */
export async function requestCertificateForHost(params: {
  hostname: string;
  agencyId: string;
}): Promise<IssuedCertificate> {
  const res = await client().send(
    new RequestCertificateCommand({
      DomainName: params.hostname,
      ValidationMethod: 'DNS',
      Tags: [
        { Key: 'agencyId', Value: params.agencyId },
        { Key: 'hostname', Value: params.hostname },
        { Key: 'managedBy', Value: 'an-whitelabel' },
      ],
      IdempotencyToken: `${params.agencyId}-${params.hostname}`
        .replace(/[^A-Za-z0-9-]/g, '-')
        .slice(0, 32),
    }),
  );
  const arn = res.CertificateArn;
  if (!arn) {
    throw new Error('ACM RequestCertificate returned no ARN');
  }
  return { certArn: arn, hostname: params.hostname };
}

/**
 * Look up the current validation record ACM wants published (for CNAME
 * method). Returns undefined if ACM hasn't yet populated it -- callers
 * should retry with backoff.
 */
export async function describeCertificateValidation(
  certArn: string,
): Promise<CertificateValidationView> {
  const res = await client().send(
    new DescribeCertificateCommand({ CertificateArn: certArn }),
  );
  const cert = res.Certificate;
  if (!cert) throw new Error('ACM DescribeCertificate returned no Certificate');

  const firstValidation: DomainValidation | undefined = (cert.DomainValidationOptions || [])[0];
  const resourceRecord = firstValidation?.ResourceRecord;

  return {
    certArn,
    status: cert.Status,
    domainValidationStatus: firstValidation?.ValidationStatus,
    validationRecord: resourceRecord
      ? {
          name: resourceRecord.Name || '',
          value: resourceRecord.Value || '',
          type: 'CNAME',
        }
      : undefined,
    notAfter: cert.NotAfter,
  };
}

export async function deleteCertificateArn(certArn: string): Promise<void> {
  await client().send(new DeleteCertificateCommand({ CertificateArn: certArn }));
}
