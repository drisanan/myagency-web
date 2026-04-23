import { getApiBaseUrl } from './env';

export type ServiceConfig = {
  apiBaseUrl: string;
};

/**
 * Canonical branding shape. After Phase 2 the runtime source of truth is
 * `AGENCY#<id>/PROFILE.settings` in DynamoDB; this module only supplies the
 * fallback used when no agency context is resolved (e.g. marketing homepage,
 * pre-auth marketing pages, or unknown hosts).
 */
export type DefaultBranding = {
  id: 'default';
  name: string;
  brand: {
    primary: string;
    secondary: string;
  };
  flags: Record<string, boolean>;
  assets?: {
    logo?: string;
    favicon?: string;
  };
};

export const defaultBranding: DefaultBranding = {
  id: 'default',
  name: 'AthleteNarrative',
  brand: {
    primary: '#0A0A0A',
    secondary: '#CCFF00',
  },
  flags: {
    aiCounselor: true,
    voiceInput: true,
    voiceOutput: true,
    recruiterEnabled: true,
    clientsEnabled: true,
  },
};

// Back-compat alias. The old `TenantRegistry` was a hardcoded {default, acme}
// placeholder; the registry now only carries the default entry, and real
// tenant resolution flows through DynamoDB (AGENCY PROFILE + DOMAIN# records).
export type TenantBrand = DefaultBranding['brand'];
export type TenantRegistryEntry = DefaultBranding;
export type TenantRegistry = Record<string, TenantRegistryEntry>;

let cachedServiceConfig: ServiceConfig | null = null;
let cachedTenantRegistry: TenantRegistry | null = null;

export function getServiceConfig(): ServiceConfig {
  if (cachedServiceConfig) return cachedServiceConfig;
  const apiBaseUrl = getApiBaseUrl();
  cachedServiceConfig = { apiBaseUrl };
  return cachedServiceConfig;
}

export function getTenantRegistry(): TenantRegistry {
  if (cachedTenantRegistry) return cachedTenantRegistry;
  cachedTenantRegistry = { default: defaultBranding };
  return cachedTenantRegistry;
}
