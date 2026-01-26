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
    requireSession: jest.fn(() => ({ agencyId: 'agency-001', agencyEmail: 'agency1@an.test', role: 'agency' })),
  };
});

jest.mock('../../lib/dynamo', () => {
  return {
    putItem: jest.fn(),
    getItem: jest.fn(),
    queryGSI1: jest.fn(),
    queryByPK: jest.fn(),
  };
});

const { putItem, queryGSI1, queryByPK } = jest.requireMock('../../lib/dynamo');
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
    const token = sign({ agencyEmail: 'agency1@an.test', clientId: 'client-1', type: 'update' });
    const res = (await handler(makeEvent('POST', '/update-forms/submit', { token, form: { size: { height: '6ft' } } }))) as any;
    expect(res.statusCode).toBe(200);
    expect(putItem).toHaveBeenCalled();
  });

  it('lists update submissions', async () => {
    queryByPK.mockResolvedValue([{ id: 'u1' }]);
    const res = (await handler(makeEvent('GET', '/update-forms/submissions'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
  });
});
