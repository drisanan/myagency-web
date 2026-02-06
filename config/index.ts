export type ServiceConfig = {
  apiBaseUrl: string;
};

export type TenantBrand = {
  primary: string;
  secondary: string;
};

export type TenantRegistryEntry = {
  id: string;
  name: string;
  brand: TenantBrand;
  flags: Record<string, boolean>;
  assets?: {
    logo?: string;
    favicon?: string;
  };
};

export type TenantRegistry = Record<string, TenantRegistryEntry>;

let cachedServiceConfig: ServiceConfig | null = null;
let cachedTenantRegistry: TenantRegistry | null = null;

export function getServiceConfig(): ServiceConfig {
  if (cachedServiceConfig) return cachedServiceConfig;
  // Use env var for local dev, fallback to prod API
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';
  cachedServiceConfig = { apiBaseUrl };
  return cachedServiceConfig;
}

export function getTenantRegistry(): TenantRegistry {
  if (cachedTenantRegistry) return cachedTenantRegistry;
  cachedTenantRegistry = {
    default: {
      id: 'default',
      name: 'AthleteNarrative',
      brand: {
        primary: '#0A0A0A',
        secondary: '#CCFF00'
      },
      flags: {
        aiCounselor: true,
        voiceInput: true,
        voiceOutput: true,
        recruiterEnabled: true,
        clientsEnabled: true
      }
    },
    acme: {
      id: 'acme',
      name: 'Acme Athletics',
      brand: {
        primary: '#0A0A0A',
        secondary: '#CCFF00'
      },
      flags: {
        aiCounselor: true,
        voiceInput: true,
        voiceOutput: true,
        recruiterEnabled: true,
        clientsEnabled: true
      }
    }
  };
  return cachedTenantRegistry;
}


