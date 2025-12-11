import { http } from '@/services/http';
import { z } from 'zod';

const AskSchema = z.object({
  question: z.string().min(1)
});

export type AskInput = z.infer<typeof AskSchema>;

export async function askCounselor(input: AskInput) {
  const body = AskSchema.parse(input);
  return http<{ answer: string }>('/ai/counselor', { method: 'POST', body });
}


