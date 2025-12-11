import { http } from '@/services/http';
import { z } from 'zod';

export async function getProfile() {
  return http<{ name: string; email: string }>('/settings/profile', { method: 'GET' });
}

const ProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

export async function updateProfile(input: ProfileInput) {
  const body = ProfileSchema.parse(input);
  return http<{ ok: boolean }>('/settings/profile', { method: 'PUT', body });
}


