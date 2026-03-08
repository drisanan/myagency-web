/**
 * @jest-environment node
 */
import { handler } from '../update-forms';
import { sign } from '../../lib/formsToken';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
}));

jest.mock('../common', () => {
  const original = jest.requireActual('../common');
  return {
    ...original,
    requireAgencySession: jest.fn(() => ({ agencyId: 'agency-001', agencyEmail: 'agency1@an.test', role: 'agency' })),
  };
});

jest.mock('../../lib/dynamo', () => {
  return {
    putItem: jest.fn(),
    getItem: jest.fn(),
    queryGSI1: jest.fn(),
    queryGSI3: jest.fn(),
    queryByPK: jest.fn(),
  };
});

const { putItem, getItem, queryGSI1, queryGSI3, queryByPK } = jest.requireMock('../../lib/dynamo');
const ORIGIN = 'http://localhost:3000';

function makeEvent(method: string, path: string, body?: any, query?: Record<string, string>) {
  return {
    requestContext: { http: { method, path } },
    rawPath: path,
    body: body ? JSON.stringify(body) : undefined,
    queryStringParameters: query,
    headers: { origin: ORIGIN },
  } as any;
}

describe('update-forms handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('issues update form link', async () => {
    const res = (await handler(makeEvent('POST', '/update-forms/issue', { clientId: 'client-1' }))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.url).toContain('/update/');
  });

  it('submits update form', async () => {
    queryGSI1.mockResolvedValue([{ id: 'agency-001', email: 'agency1@an.test' }]);
    getItem.mockResolvedValue({ id: 'client-1', firstName: 'Ava', lastName: 'Smith' });
    const token = sign({ agencyEmail: 'agency1@an.test', agencyId: 'agency-001', clientId: 'client-1', type: 'update' });
    const res = (await handler(makeEvent('POST', '/update-forms/submit', { token, form: { size: { height: '6ft' } } }))) as any;
    expect(res.statusCode).toBe(200);
    expect(putItem).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 'client-1',
      size: { height: '6ft' },
    }));
  });

  it('lists update submissions', async () => {
    queryGSI3.mockResolvedValue([{ id: 'u1', agencyId: 'agency-001', submittedAt: 2 }, { id: 'u2', agencyId: 'agency-001', submittedAt: 1 }]);
    const res = (await handler(makeEvent('GET', '/update-forms/submissions', undefined, { clientId: 'client-1' }))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.items.map((item: any) => item.id)).toEqual(['u1', 'u2']);
  });

  it('marks update submissions reviewed', async () => {
    queryByPK.mockResolvedValue([{ id: 'u1', agencyId: 'agency-001', submittedAt: 1 }]);
    const res = (await handler(makeEvent('POST', '/update-forms/consume', { ids: ['u1'] }))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.reviewed).toBe(1);
  });
});
