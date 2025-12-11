import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus } from '@/services/tasks';

type CreateInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueAt?: number;
  athleteId?: string | null;
};

type UpdateInput = {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueAt?: number | null;
};

async function fetchTasks(agencyEmail: string, athleteId?: string | null) {
  const params = new URLSearchParams();
  params.set('agencyEmail', agencyEmail);
  if (athleteId) params.set('athleteId', athleteId);
  const res = await fetch(`/api/tasks?${params.toString()}`);
  const data = await res.json();
  return (data?.data as Task[]) || [];
}

async function createTaskReq(agencyEmail: string, input: CreateInput) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, agencyEmail }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

async function updateTaskReq(agencyEmail: string, input: UpdateInput) {
  const res = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, agencyEmail }),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

async function deleteTaskReq(agencyEmail: string, id: string) {
  const res = await fetch('/api/tasks', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, agencyEmail }),
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export function useTasks(agencyEmail: string, athleteId?: string | null) {
  const qc = useQueryClient();
  const queryKey = ['tasks', agencyEmail, athleteId || 'all'];

  const query = useQuery({
    queryKey,
    enabled: Boolean(agencyEmail),
    queryFn: () => fetchTasks(agencyEmail, athleteId),
  });

  const createMut = useMutation({
    mutationFn: (input: CreateInput) => createTaskReq(agencyEmail, input),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateMut = useMutation({
    mutationFn: (input: UpdateInput) => updateTaskReq(agencyEmail, input),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTaskReq(agencyEmail, id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    query,
    tasks: query.data ?? [],
    createTask: createMut.mutateAsync,
    updateTask: updateMut.mutateAsync,
    deleteTask: deleteMut.mutateAsync,
    creating: createMut.status === 'pending',
    updating: updateMut.status === 'pending',
    deleting: deleteMut.status === 'pending',
  };
}


