import { tasksDueSoon, Task } from '../tasks';

describe('tasks service', () => {
  test('due soon helper detects tasks within window', () => {
    const now = Date.now();
    const t1: Task = {
      id: 'task-1',
      title: 'Due soon',
      status: 'todo',
      dueAt: now + 2 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    };
    const t2: Task = {
      id: 'task-2',
      title: 'Later',
      status: 'todo',
      dueAt: now + 3 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    };
    const due = tasksDueSoon([t1, t2]);
    expect(due.map((t) => t.id)).toContain(t1.id);
    expect(due.map((t) => t.id)).not.toContain(t2.id);
  });

  test('due soon excludes done tasks', () => {
    const now = Date.now();
    const t1: Task = {
      id: 'task-1',
      title: 'Done task',
      status: 'done',
      dueAt: now + 2 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    };
    const due = tasksDueSoon([t1]);
    expect(due).toHaveLength(0);
  });
});
