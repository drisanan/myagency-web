import { createTask, deleteTask, listTasks, updateTask, tasksDueSoon } from '../tasks';

describe('tasks service', () => {
  const agencyEmail = 'agency@test.dev';

  beforeEach(() => {
    // reset storage by recreating tasks in memory
    (global as any).localStorage?.clear?.();
  });

  test('create, update, list, delete tasks', () => {
    const created = createTask({ agencyEmail, title: 'Task 1', status: 'todo' });
    expect(created.title).toBe('Task 1');

    const listed = listTasks({ agencyEmail });
    expect(listed.find((t) => t.id === created.id)).toBeTruthy();

    const updated = updateTask(created.id, { status: 'done' });
    expect(updated?.status).toBe('done');

    deleteTask(created.id);
    const afterDelete = listTasks({ agencyEmail });
    expect(afterDelete.find((t) => t.id === created.id)).toBeFalsy();
  });

  test('due soon helper detects tasks within window', () => {
    const now = Date.now();
    const t1 = createTask({ agencyEmail, title: 'Due soon', status: 'todo', dueAt: now + 2 * 60 * 60 * 1000 });
    const t2 = createTask({ agencyEmail, title: 'Later', status: 'todo', dueAt: now + 3 * 24 * 60 * 60 * 1000 });
    const due = tasksDueSoon([t1, t2]);
    expect(due.map((t) => t.id)).toContain(t1.id);
    expect(due.map((t) => t.id)).not.toContain(t2.id);
  });
});


