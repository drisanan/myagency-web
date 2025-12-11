import { http } from '@/services/http';
import { z } from 'zod';

const ComposeSchema = z.object({
  caption: z.string().min(1)
});

export type ComposeInput = z.infer<typeof ComposeSchema>;

export async function generateSharePreview(input: ComposeInput) {
  const body = ComposeSchema.parse(input);
  return http<{ url: string }>('/social/preview', { method: 'POST', body });
}


