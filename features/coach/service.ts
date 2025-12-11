import { http } from '@/services/http';
import { z } from 'zod';

export async function getRoster() {
  return http<Array<{ id: string; name: string }>>('/coach/roster', { method: 'GET' });
}

const NoteSchema = z.object({
  athleteId: z.string(),
  text: z.string().min(1)
});

export type AddNoteInput = z.infer<typeof NoteSchema>;

export async function addNote(input: AddNoteInput) {
  const body = NoteSchema.parse(input);
  return http<{ ok: boolean }>('/coach/note', { method: 'POST', body });
}


