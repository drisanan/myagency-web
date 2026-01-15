import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Note = {
  id: string;
  athleteId: string;
  agencyEmail?: string;
  agencyId?: string;
  author?: string;
  title?: string;
  body: string;
  type?: 'recruiting' | 'account' | 'advice' | 'event' | 'other';
  createdAt: number;
  updatedAt: number;
};

// Use Lambda backend directly to ensure session cookie is passed
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';

async function fetchNotes(athleteId: string, _agencyEmail: string) {
  const params = new URLSearchParams({ athleteId });
  const res = await fetch(`${API_BASE}/notes?${params.toString()}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[useNotes] fetchNotes failed:', res.status, text);
    throw new Error('Failed to load notes');
  }
  const data = await res.json();
  return ((data?.notes || []) as Note[]).sort((a, b) => b.createdAt - a.createdAt);
}

async function createNoteReq(input: { athleteId: string; body: string; title?: string; type?: Note['type']; author?: string }) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[useNotes] createNote failed:', res.status, text);
    throw new Error('Failed to create note');
  }
  const data = await res.json();
  return data?.note as Note;
}

async function updateNoteReq(id: string, patch: Partial<Note>) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[useNotes] updateNote failed:', res.status, text);
    throw new Error('Failed to update note');
  }
  const data = await res.json();
  return data?.note as Note;
}

async function deleteNoteReq(id: string) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[useNotes] deleteNote failed:', res.status, text);
    throw new Error('Failed to delete note');
  }
  return true;
}

export function useNotes(athleteId: string, agencyEmail: string) {
  const qc = useQueryClient();
  const queryKey = ['notes', athleteId];
  const query = useQuery({
    queryKey,
    queryFn: () => fetchNotes(athleteId, agencyEmail),
    enabled: Boolean(athleteId),
  });

  const createMut = useMutation({
    mutationFn: (input: { title?: string; body: string; type?: Note['type']; author?: string }) =>
      createNoteReq({ ...input, athleteId, body: input.body }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateMut = useMutation({
    mutationFn: (input: { id: string; title?: string; body?: string; type?: Note['type'] }) =>
      updateNoteReq(input.id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteNoteReq(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    query,
    notes: query.data ?? [],
    createNote: createMut.mutateAsync,
    updateNote: updateMut.mutateAsync,
    deleteNote: deleteMut.mutateAsync,
    creating: createMut.status === 'pending',
    updating: updateMut.status === 'pending',
    deleting: deleteMut.status === 'pending',
  };
}


