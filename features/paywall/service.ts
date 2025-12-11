import { http } from '@/services/http';
import { z } from 'zod';

const EntitlementSchema = z.object({
  entitled: z.boolean()
});

export async function getEntitlement(feature: string) {
  const res = await http<{ entitled: boolean }>(`/paywall/entitlement?feature=${encodeURIComponent(feature)}`, { method: 'GET' });
  return EntitlementSchema.parse(res);
}


