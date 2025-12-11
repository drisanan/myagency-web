import { clearAuditLog, listAuditLog, logEvent, logImpersonationEnd, logImpersonationStart } from '@/services/audit';

describe('audit service', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  test('logs impersonation start and end', () => {
    const id1 = logImpersonationStart('parent@an.test', 'agency1@an.test');
    const id2 = logImpersonationEnd('parent@an.test', 'agency1@an.test');
    const items = listAuditLog();
    expect(items.length).toBe(2);
    expect(items[0].id).toBe(id1);
    expect(items[0].type).toBe('impersonation_start');
    expect(items[1].id).toBe(id2);
    expect(items[1].type).toBe('impersonation_end');
  });

  test('logs generic action', () => {
    const id = logEvent({ type: 'action', actorEmail: 'parent', actorRole: 'parent', details: { op: 'test' } });
    const items = listAuditLog();
    expect(items.find(x => x.id === id)).toBeTruthy();
  });
});


