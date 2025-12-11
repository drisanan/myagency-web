export type TenantConfig = {
  id: string;
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


