import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, listTasks, createTask, updateTask, deleteTask } from '@/services/tasks';

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
  dueAt?: number;
};

export function useTasks(_agencyEmail: string, athleteId?: string | null) {
  const qc = useQueryClient();
  const queryKey = ['tasks', athleteId || 'all'];

  const query = useQuery({
    queryKey,
    queryFn: () => listTasks({ athleteId }),
  });

  const createMut = useMutation({
    mutationFn: (input: CreateInput) => createTask(input),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateMut = useMutation({
    mutationFn: (input: UpdateInput) => updateTask(input.id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
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


