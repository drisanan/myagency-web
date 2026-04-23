jest.mock('../../infra-adapter/dynamo', () => ({
  getItem: jest.fn(),
  queryGSI1: jest.fn(),
  queryByPK: jest.fn(),
}));

import {
  resolveLandingByAgencyId,
  resolveLandingByHostname,
} from '../landingResolver';
import { getItem, queryByPK, queryGSI1 } from '../../infra-adapter/dynamo';

const getItemMock = getItem as jest.MockedFunction<typeof getItem>;
const queryGSI1Mock = queryGSI1 as jest.MockedFunction<typeof queryGSI1>;
const queryByPKMock = queryByPK as jest.MockedFunction<typeof queryByPK>;

const baseAgency = {
  PK: 'AGENCY#a1',
  SK: 'PROFILE',
  GSI1PK: 'EMAIL#a@b.c',
  GSI1SK: 'AGENCY#a1',
  id: 'a1',
  name: 'Acme Recruiting',
  email: 'a@b.c',
  settings: {
    primaryColor: '#111',
    landing: {
      templateId: 'athleteClassic' as const,
      hero: { headline: 'Welcome' },
    },
  },
};

const activeDomain = {
  PK: 'AGENCY#a1',
  SK: 'DOMAIN#app.acme.com',
  GSI1PK: 'DOMAIN#app.acme.com',
  GSI1SK: 'AGENCY#a1',
  id: 'a1:app.acme.com',
  agencyId: 'a1',
  hostname: 'app.acme.com',
  status: 'ACTIVE' as const,
  createdAt: 1,
  updatedAt: 2,
};

describe('landingResolver.resolveLandingByHostname', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when hostname cannot be normalized', async () => {
    const result = await resolveLandingByHostname('not a host!!!');
    expect(result).toBeNull();
    expect(queryGSI1Mock).not.toHaveBeenCalled();
  });

  it('returns null when no ACTIVE domain record exists', async () => {
    queryGSI1Mock.mockResolvedValueOnce([{ ...activeDomain, status: 'PENDING' }]);
    const result = await resolveLandingByHostname('app.acme.com');
    expect(result).toBeNull();
  });

  it('returns null when agency record is missing', async () => {
    queryGSI1Mock.mockResolvedValueOnce([activeDomain]);
    getItemMock.mockResolvedValueOnce(undefined as unknown as Record<string, unknown>);
    const result = await resolveLandingByHostname('app.acme.com');
    expect(result).toBeNull();
  });

  it('resolves active domain to agency + landing config', async () => {
    queryGSI1Mock.mockResolvedValueOnce([activeDomain]);
    getItemMock.mockResolvedValueOnce(baseAgency as unknown as Record<string, unknown>);
    const result = await resolveLandingByHostname('APP.acme.com.');
    expect(result).not.toBeNull();
    expect(result?.agency.id).toBe('a1');
    expect(result?.landing.hero?.headline).toBe('Welcome');
    expect(queryGSI1Mock).toHaveBeenCalledWith('DOMAIN#app.acme.com');
    expect(getItemMock).toHaveBeenCalledWith({ PK: 'AGENCY#a1', SK: 'PROFILE' });
  });
});

describe('landingResolver.resolveLandingByAgencyId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when agency record missing', async () => {
    getItemMock.mockResolvedValueOnce(undefined as unknown as Record<string, unknown>);
    const result = await resolveLandingByAgencyId('missing');
    expect(result).toBeNull();
  });

  it('returns synthetic preview domain for preview mode', async () => {
    getItemMock.mockResolvedValueOnce(baseAgency as unknown as Record<string, unknown>);
    queryByPKMock.mockResolvedValueOnce([]);
    const result = await resolveLandingByAgencyId('a1');
    expect(result?.domain.hostname).toBe('__preview__');
    expect(result?.domain.status).toBe('ACTIVE');
    expect(result?.landing.templateId).toBe('athleteClassic');
    expect(result?.isPreview).toBe(true);
    expect(result?.activeCustomHostname).toBeNull();
  });

  it('surfaces the agency active custom hostname on preview', async () => {
    getItemMock.mockResolvedValueOnce(baseAgency as unknown as Record<string, unknown>);
    queryByPKMock.mockResolvedValueOnce([activeDomain]);
    const result = await resolveLandingByAgencyId('a1');
    expect(result?.activeCustomHostname).toBe('app.acme.com');
  });
});
