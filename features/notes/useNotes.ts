import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Note = {
  id: string;
  athleteId: string;
  agencyEmail: string;
  author?: string;
  title?: string;
  body: string;
  type?: 'call' | 'coach' | 'dm' | 'event' | 'other';
  createdAt: number;
  updatedAt: number;
};

async function fetchNotes(athleteId: string, agencyEmail: string) {
  const res = await fetch(`/api/notes?athleteId=${encodeURIComponent(athleteId)}&agencyEmail=${encodeURIComponent(agencyEmail)}`);
  if (!res.ok) throw new Error('Failed to load notes');
  const data = await res.json();
  return (data?.data as Note[]).sort((a, b) => b.createdAt - a.createdAt);
}

async function createNoteReq(input: Partial<Note> & { athleteId: string; agencyEmail: string; body: string }) {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agency-email': input.agencyEmail },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create note');
  const data = await res.json();
  return data?.data as Note;
}

async function updateNoteReq(id: string, patch: Partial<Note>, agencyEmail: string) {
  const res = await fetch('/api/notes', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-agency-email': agencyEmail },
    body: JSON.stringify({ id, ...patch, agencyEmail }),
  });
  if (!res.ok) throw new Error('Failed to update note');
  const data = await res.json();
  return data?.data as Note;
}

async function deleteNoteReq(id: string, agencyEmail: string) {
  const res = await fetch('/api/notes', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x-agency-email': agencyEmail },
    body: JSON.stringify({ id, agencyEmail }),
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return true;
}

export function useNotes(athleteId: string, agencyEmail: string) {
  const qc = useQueryClient();
  const queryKey = ['notes', athleteId, agencyEmail];
  const query = useQuery({
    queryKey,
    queryFn: () => fetchNotes(athleteId, agencyEmail),
    enabled: Boolean(athleteId && agencyEmail),
  });

  const createMut = useMutation({
    mutationFn: (input: { title?: string; body: string; type?: Note['type']; author?: string }) =>
      createNoteReq({ ...input, athleteId, agencyEmail, body: input.body }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateMut = useMutation({
    mutationFn: (input: { id: string; title?: string; body?: string; type?: Note['type'] }) =>
      updateNoteReq(input.id, input, agencyEmail),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteNoteReq(id, agencyEmail),
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


