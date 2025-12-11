export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: string;
  agencyEmail: string;
  athleteId?: string | null;
  title: string;
  description?: string;
  status: TaskStatus;
  dueAt?: number; // ms epoch
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'tasks_data';

function readStore(): Task[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(items: Task[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let TASKS: Task[] = readStore();

export function listTasks(input: { agencyEmail: string; athleteId?: string | null; status?: TaskStatus }) {
  const { agencyEmail, athleteId, status } = input;
  if (typeof window !== 'undefined') TASKS = readStore();
  return TASKS.filter((t) => {
    if (t.agencyEmail !== agencyEmail) return false;
    if (athleteId && t.athleteId !== athleteId) return false;
    if (status && t.status !== status) return false;
    return true;
  });
}

export function createTask(input: {
  agencyEmail: string;
  athleteId?: string | null;
  title: string;
  description?: string;
  status?: TaskStatus;
  dueAt?: number;
}) {
  const now = Date.now();
  const task: Task = {
    id: `task-${now}-${Math.random().toString(36).slice(2, 8)}`,
    agencyEmail: input.agencyEmail,
    athleteId: input.athleteId || null,
    title: input.title,
    description: input.description,
    status: input.status ?? 'todo',
    dueAt: input.dueAt,
    createdAt: now,
    updatedAt: now,
  };
  TASKS.unshift(task);
  writeStore(TASKS);
  return task;
}

export function updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'agencyEmail' | 'createdAt'>>) {
  const idx = TASKS.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const next: Task = { ...TASKS[idx], ...patch, updatedAt: Date.now() };
  TASKS[idx] = next;
  writeStore(TASKS);
  return next;
}

export function deleteTask(id: string) {
  const idx = TASKS.findIndex((t) => t.id === id);
  if (idx >= 0) {
    TASKS.splice(idx, 1);
    writeStore(TASKS);
  }
}

export function tasksDueSoon(tasks: Task[], withinMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  return tasks.filter((t) => t.dueAt && t.status !== 'done' && t.dueAt - now <= withinMs && t.dueAt >= now);
}


