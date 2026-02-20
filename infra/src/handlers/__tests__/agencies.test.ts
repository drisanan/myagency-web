/**
 * @jest-environment node
 */

const ORIGIN = 'http://localhost:3000';
const SESSION = {
  agencyId: 'agency-be7e452e-test',
  agencyEmail: 'test@agency.com',
  role: 'agency' as const,
  firstName: 'Test',
  lastName: 'User',
};

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
  Sentry: { init: jest.fn(), captureException: jest.fn() },
}));

jest.mock('../common', () => {
  const original = jest.requireActual('../common');
  return {
    ...original,
    requireSession: jest.fn(() => SESSION),
  };
});

jest.mock('../../lib/dynamo', () => ({
  getItem: jest.fn(),
  putItem: jest.fn(),
  queryGSI1: jest.fn(),
  queryGSI2: jest.fn(),
}));

// Import after mocks are set up
import { handler } from '../agencies';

const { requireSession } = jest.requireMock('../common');
const { getItem, putItem, queryGSI1, queryGSI2 } = jest.requireMock('../../lib/dynamo');

const AGENCY_RECORD = {
  PK: `AGENCY#${SESSION.agencyId}`,
  SK: 'PROFILE',
  GSI1PK: `EMAIL#${SESSION.agencyEmail}`,
  GSI1SK: `AGENCY#${SESSION.agencyId}`,
  id: SESSION.agencyId,
  email: SESSION.agencyEmail,
  name: 'Test Agency',
  settings: {},
  subscriptionLevel: 'starter',
  createdAt: 1700000000000,
};

function makeEvent(
  method: string,
  path: string,
  body?: any,
  params?: Record<string, string>,
  qs?: Record<string, string>,
) {
  return {
    requestContext: { http: { method } },
    rawPath: path,
    body: body ? JSON.stringify(body) : undefined,
    pathParameters: params,
    queryStringParameters: qs,
    headers: { origin: ORIGIN },
  } as any;
}

function parseBody(res: any) {
  return JSON.parse(res.body || '{}');
}

describe('agencies handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireSession.mockReturnValue(SESSION);
  });

  // ── OPTIONS ──
  it('handles OPTIONS with CORS', async () => {
    const res = (await handler(makeEvent('OPTIONS', '/agencies'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBeTruthy();
    expect(res.headers['Access-Control-Allow-Methods']).toContain('PUT');
  });

  // ── GET /agencies ──
  describe('GET /agencies', () => {
    it('returns agency by email via GSI1', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      const res = (await handler(makeEvent('GET', '/agencies'))) as any;
      expect(res.statusCode).toBe(200);
      const body = parseBody(res);
      expect(body.ok).toBe(true);
      expect(body.agencies).toHaveLength(1);
      expect(body.agencies[0].id).toBe(SESSION.agencyId);
      expect(queryGSI1).toHaveBeenCalledWith(`EMAIL#${SESSION.agencyEmail}`, 'AGENCY#');
    });

    it('falls back to PK lookup when GSI1 returns empty', async () => {
      queryGSI1.mockResolvedValue([]);
      getItem.mockResolvedValue(AGENCY_RECORD);
      const res = (await handler(makeEvent('GET', '/agencies'))) as any;
      expect(res.statusCode).toBe(200);
      const body = parseBody(res);
      expect(body.agencies).toHaveLength(1);
      expect(getItem).toHaveBeenCalledWith({
        PK: `AGENCY#${SESSION.agencyId}`,
        SK: 'PROFILE',
      });
    });

    it('returns 401 when no session', async () => {
      requireSession.mockReturnValue(null);
      const res = (await handler(makeEvent('GET', '/agencies'))) as any;
      expect(res.statusCode).toBe(401);
    });
  });

  // ── PUT /agencies/slug ──
  describe('PUT /agencies/slug', () => {
    it('saves a valid slug', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      queryGSI2.mockResolvedValue([]);
      putItem.mockResolvedValue({});

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'my-agency' }),
      )) as any;

      expect(res.statusCode).toBe(200);
      const body = parseBody(res);
      expect(body.ok).toBe(true);
      expect(body.slug).toBe('my-agency');
      expect(putItem).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'my-agency',
          GSI2PK: 'SLUG#my-agency',
          GSI2SK: `AGENCY#${SESSION.agencyId}`,
          PK: AGENCY_RECORD.PK,
          SK: 'PROFILE',
        }),
      );
    });

    it('normalizes slug to lowercase alphanumeric + hyphens', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      queryGSI2.mockResolvedValue([]);
      putItem.mockResolvedValue({});

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'My Agency Name!' }),
      )) as any;

      expect(res.statusCode).toBe(200);
      expect(parseBody(res).slug).toBe('myagencyname');
    });

    it('returns 400 when slug is missing', async () => {
      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', {}),
      )) as any;
      expect(res.statusCode).toBe(400);
      expect(parseBody(res).error).toBe('Slug is required');
      expect(putItem).not.toHaveBeenCalled();
    });

    it('returns 400 when slug is too short after normalization', async () => {
      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'ab' }),
      )) as any;
      expect(res.statusCode).toBe(400);
      expect(parseBody(res).error).toMatch(/3-50 characters/);
      expect(putItem).not.toHaveBeenCalled();
    });

    it('returns 400 when slug normalizes to empty', async () => {
      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: '!!!' }),
      )) as any;
      expect(res.statusCode).toBe(400);
      expect(putItem).not.toHaveBeenCalled();
    });

    it('returns 401 when no session', async () => {
      requireSession.mockReturnValue(null);
      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'test-slug' }),
      )) as any;
      expect(res.statusCode).toBe(401);
      expect(putItem).not.toHaveBeenCalled();
    });

    it('returns 400 when body is missing', async () => {
      const event = {
        requestContext: { http: { method: 'PUT' } },
        rawPath: '/agencies/slug',
        body: undefined,
        headers: { origin: ORIGIN },
      } as any;
      const res = (await handler(event)) as any;
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when agency not found by GSI1 or PK', async () => {
      queryGSI1.mockResolvedValue([]);
      getItem.mockResolvedValue(null);

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'test-slug' }),
      )) as any;

      expect(res.statusCode).toBe(404);
      expect(parseBody(res).error).toBe('Agency not found');
      expect(putItem).not.toHaveBeenCalled();
    });

    it('falls back to PK lookup when GSI1 returns nothing', async () => {
      queryGSI1.mockResolvedValue([]);
      getItem.mockResolvedValue(AGENCY_RECORD);
      queryGSI2.mockResolvedValue([]);
      putItem.mockResolvedValue({});

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'test-slug' }),
      )) as any;

      expect(res.statusCode).toBe(200);
      expect(getItem).toHaveBeenCalledWith({
        PK: `AGENCY#${SESSION.agencyId}`,
        SK: 'PROFILE',
      });
    });

    it('returns 409 when slug is taken by another agency', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      queryGSI2.mockResolvedValue([
        { id: 'agency-different-id', slug: 'taken-slug' },
      ]);

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'taken-slug' }),
      )) as any;

      expect(res.statusCode).toBe(409);
      expect(parseBody(res).error).toMatch(/already taken/);
      expect(putItem).not.toHaveBeenCalled();
    });

    it('allows re-saving the same slug for the same agency', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      queryGSI2.mockResolvedValue([AGENCY_RECORD]);
      putItem.mockResolvedValue({});

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'my-slug' }),
      )) as any;

      expect(res.statusCode).toBe(200);
      expect(parseBody(res).slug).toBe('my-slug');
      expect(putItem).toHaveBeenCalled();
    });

    it('preserves all existing agency fields when saving slug', async () => {
      const fullRecord = {
        ...AGENCY_RECORD,
        contactId: 'ghl-contact-123',
        subscriptionLevel: 'unlimited',
        settings: { primaryColor: '#000' },
      };
      queryGSI1.mockResolvedValue([fullRecord]);
      queryGSI2.mockResolvedValue([]);
      putItem.mockResolvedValue({});

      await handler(makeEvent('PUT', '/agencies/slug', { slug: 'test-slug' }));

      expect(putItem).toHaveBeenCalledWith(
        expect.objectContaining({
          contactId: 'ghl-contact-123',
          subscriptionLevel: 'unlimited',
          settings: { primaryColor: '#000' },
          slug: 'test-slug',
          GSI2PK: 'SLUG#test-slug',
        }),
      );
    });

    it('returns 500 on unexpected DynamoDB error', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      queryGSI2.mockRejectedValue(new Error('ResourceNotFoundException'));

      const res = (await handler(
        makeEvent('PUT', '/agencies/slug', { slug: 'test-slug' }),
      )) as any;

      expect(res.statusCode).toBe(500);
      expect(parseBody(res).error).toBe('Server error');
    });
  });

  // ── PUT /agencies/settings ──
  describe('PUT /agencies/settings', () => {
    it('updates settings for an existing agency', async () => {
      queryGSI1.mockResolvedValue([AGENCY_RECORD]);
      putItem.mockResolvedValue({});

      const newSettings = { primaryColor: '#FF0000', secondaryColor: '#00FF00' };
      const res = (await handler(
        makeEvent('PUT', '/agencies/settings', { settings: newSettings }),
      )) as any;

      expect(res.statusCode).toBe(200);
      const body = parseBody(res);
      expect(body.ok).toBe(true);
      expect(body.settings).toEqual(newSettings);
      expect(putItem).toHaveBeenCalledWith(
        expect.objectContaining({ settings: newSettings }),
      );
    });

    it('falls back to PK lookup when GSI1 misses', async () => {
      queryGSI1.mockResolvedValue([]);
      getItem.mockResolvedValue(AGENCY_RECORD);
      putItem.mockResolvedValue({});

      const res = (await handler(
        makeEvent('PUT', '/agencies/settings', { settings: { primaryColor: '#000' } }),
      )) as any;

      expect(res.statusCode).toBe(200);
      expect(getItem).toHaveBeenCalledWith({
        PK: `AGENCY#${SESSION.agencyId}`,
        SK: 'PROFILE',
      });
    });

    it('auto-creates agency profile when missing entirely', async () => {
      queryGSI1.mockResolvedValue([]);
      getItem.mockResolvedValue(null);
      putItem.mockResolvedValue({});

      const res = (await handler(
        makeEvent('PUT', '/agencies/settings', { settings: { primaryColor: '#FFF' } }),
      )) as any;

      expect(res.statusCode).toBe(200);
      expect(putItem).toHaveBeenCalledTimes(2); // once for auto-repair, once for update
    });

    it('returns 401 when no session', async () => {
      requireSession.mockReturnValue(null);
      const res = (await handler(
        makeEvent('PUT', '/agencies/settings', { settings: {} }),
      )) as any;
      expect(res.statusCode).toBe(401);
    });
  });

  // ── POST /agencies ──
  describe('POST /agencies', () => {
    it('creates a new agency', async () => {
      putItem.mockResolvedValue({});
      const res = (await handler(
        makeEvent('POST', '/agencies', { email: 'new@agency.com', name: 'New Agency' }),
      )) as any;
      expect(res.statusCode).toBe(200);
      expect(parseBody(res).ok).toBe(true);
      expect(parseBody(res).id).toBeTruthy();
      expect(putItem).toHaveBeenCalled();
    });

    it('returns 400 when name is missing', async () => {
      const res = (await handler(
        makeEvent('POST', '/agencies', { email: 'test@test.com' }),
      )) as any;
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when email is missing', async () => {
      const res = (await handler(
        makeEvent('POST', '/agencies', { name: 'Test' }),
      )) as any;
      expect(res.statusCode).toBe(400);
    });

    it('returns 403 when trying to update another agency', async () => {
      const res = (await handler(
        makeEvent('POST', '/agencies', {
          id: 'agency-someone-else',
          email: 'other@test.com',
          name: 'Other',
        }),
      )) as any;
      expect(res.statusCode).toBe(403);
    });

    it('allows updating own agency', async () => {
      getItem.mockResolvedValue(AGENCY_RECORD);
      putItem.mockResolvedValue({});
      const res = (await handler(
        makeEvent('POST', '/agencies', {
          id: SESSION.agencyId,
          email: SESSION.agencyEmail,
          name: 'Updated Name',
        }),
      )) as any;
      expect(res.statusCode).toBe(200);
    });
  });

  // ── DELETE /agencies ──
  describe('DELETE /agencies', () => {
    it('soft-deletes own agency', async () => {
      getItem.mockResolvedValue(AGENCY_RECORD);
      putItem.mockResolvedValue({});
      const res = (await handler(
        makeEvent('DELETE', '/agencies', undefined, undefined, { id: SESSION.agencyId }),
      )) as any;
      expect(res.statusCode).toBe(200);
      expect(putItem).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(String) }),
      );
    });

    it('returns 403 when trying to delete another agency', async () => {
      const res = (await handler(
        makeEvent('DELETE', '/agencies', undefined, undefined, { id: 'agency-other' }),
      )) as any;
      expect(res.statusCode).toBe(403);
    });

    it('returns 401 when no session', async () => {
      requireSession.mockReturnValue(null);
      const res = (await handler(
        makeEvent('DELETE', '/agencies', undefined, undefined, { id: SESSION.agencyId }),
      )) as any;
      expect(res.statusCode).toBe(401);
    });
  });

  // ── Unsupported method ──
  it('returns 405 for unsupported methods', async () => {
    const res = (await handler(makeEvent('PATCH', '/agencies'))) as any;
    expect(res.statusCode).toBe(405);
  });
});
