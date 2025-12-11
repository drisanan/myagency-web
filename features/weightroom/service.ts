import { http } from '@/services/http';
import { z } from 'zod';

const Registrant = z.object({
  name: z.string().min(1),
  email: z.string().email()
});
export type Registrant = z.infer<typeof Registrant>;

export async function register(input: Registrant) {
  const body = Registrant.parse(input);
  return http<{ ok: boolean }>('/weightroom/register', { method: 'POST', body });
}

export async function getSessions() {
  return http<Array<{ id: string; title: string }>>('/weightroom/sessions', { method: 'GET' });
}


