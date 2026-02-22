/**
 * @jest-environment node
 */

const ORIGIN = 'http://localhost:3000';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
  Sentry: { init: jest.fn(), captureException: jest.fn() },
  captureMessage: jest.fn(),
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
    getItem: jest.fn(),
    putItem: jest.fn(),
    deleteItem: jest.fn(),
    queryByPK: jest.fn(),
    queryByPKPaginated: jest.fn(),
    queryGSI3: jest.fn(),
  };
});

jest.mock('../../lib/auth', () => ({
  hashAccessCode: jest.fn(async (code: string) => `hashed_${code}`),
  verifyAccessCode: jest.fn(),
}));

jest.mock('../../lib/audit', () => ({
  logAuditEvent: jest.fn(),
  extractAuditContext: jest.fn(() => ({})),
}));

import { handler } from '../clients';
const { queryByPK, putItem, getItem } = jest.requireMock('../../lib/dynamo');

function makeEvent(method: string, body?: any, params?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    pathParameters: params,
    headers: { origin: ORIGIN },
  } as any;
}

function parseBody(res: any) {
  return JSON.parse(res.body || '{}');
}

describe('clients handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists clients for agency', async () => {
    queryByPK.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
    const res = (await handler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(200);
    const body = parseBody(res);
    expect(body.clients).toHaveLength(2);
    expect(queryByPK).toHaveBeenCalledWith('AGENCY#agency-001', 'CLIENT#');
  });

  it('creates a client for agency', async () => {
    getItem.mockResolvedValue({ subscriptionLevel: 'unlimited' });
    putItem.mockResolvedValue({});
    queryByPK.mockResolvedValue([]);
    const payload = { email: 'x@test.com', firstName: 'X', lastName: 'Y', sport: 'Football' };
    const res = (await handler(makeEvent('POST', payload))) as any;
    expect(res.statusCode).toBe(200);
    const body = parseBody(res);
    expect(body.client.email).toBe('x@test.com');
    expect(putItem).toHaveBeenCalled();
  });

  it('gets a client by id', async () => {
    getItem.mockResolvedValue({ id: 'c123', email: 'e@test.com' });
    const res = (await handler(makeEvent('GET', undefined, { id: 'c123' }))) as any;
    expect(res.statusCode).toBe(200);
    const body = parseBody(res);
    expect(body.client.id).toBe('c123');
    expect(getItem).toHaveBeenCalledWith({ PK: 'AGENCY#agency-001', SK: 'CLIENT#c123' });
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS'))) as any;
    expect(res.statusCode).toBe(200);
  });

  describe('PUT /clients/:id', () => {
    const existingClient = {
      PK: 'AGENCY#agency-001',
      SK: 'CLIENT#c-100',
      id: 'c-100',
      email: 'athlete@test.com',
      firstName: 'Ava',
      lastName: 'Smith',
      sport: 'Football',
    };

    it('updates a client', async () => {
      getItem.mockResolvedValue(existingClient);
      putItem.mockResolvedValue({});
      const res = (await handler(
        makeEvent('PUT', { firstName: 'Updated' }, { id: 'c-100' }),
      )) as any;
      expect(res.statusCode).toBe(200);
      expect(parseBody(res).client.firstName).toBe('Updated');
    });

    it('returns 404 when client does not exist', async () => {
      getItem.mockResolvedValue(null);
      const res = (await handler(
        makeEvent('PUT', { firstName: 'X' }, { id: 'c-missing' }),
      )) as any;
      expect(res.statusCode).toBe(404);
    });

    it('returns 400 with descriptive error when DynamoDB item too large', async () => {
      getItem.mockResolvedValue(existingClient);
      putItem.mockRejectedValue(new Error('Item size has exceeded the maximum allowed size'));

      const res = (await handler(
        makeEvent('PUT', { galleryImages: ['huge-data'] }, { id: 'c-100' }),
      )) as any;

      expect(res.statusCode).toBe(400);
      const body = parseBody(res);
      expect(body.error).toMatch(/too large/i);
      expect(body.ok).toBe(false);
    });

    it('returns 400 with generic error on other putItem failures', async () => {
      getItem.mockResolvedValue(existingClient);
      putItem.mockRejectedValue(new Error('ConditionalCheckFailedException'));

      const res = (await handler(
        makeEvent('PUT', { firstName: 'X' }, { id: 'c-100' }),
      )) as any;

      expect(res.statusCode).toBe(400);
      const body = parseBody(res);
      expect(body.error).toContain('ConditionalCheckFailedException');
    });
  });
});

