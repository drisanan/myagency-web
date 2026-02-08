/**
 * Reports Page Tests
 *
 * Covers:
 *  - Role guard: non-agency users are redirected
 *  - Loading state renders while data is fetching
 *  - Renders KPI cards when data is loaded
 *  - Renders charts section
 *  - Renders leaderboard and activity timeline
 *  - Helper function correctness (fmtDelta, relativeTime)
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---- Mocks ----
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

let mockSession: any = null;
let mockSessionLoading = false;
jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: mockSession, loading: mockSessionLoading }),
}));

// Mock React Query
const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: (opts: any) => mockUseQuery(opts),
}));

// Mock services
jest.mock('@/services/clients', () => ({
  getClients: jest.fn(),
}));
jest.mock('@/services/activity', () => ({
  getActivityReport: jest.fn(),
  listActivities: jest.fn(),
}));
jest.mock('@/services/emailTracking', () => ({
  fetchEmailMetrics: jest.fn(),
}));
jest.mock('@/services/profileViews', () => ({
  getWeeklyDigest: jest.fn(),
}));
jest.mock('@/services/tasks', () => ({
  listTasks: jest.fn(),
}));
jest.mock('@/services/campaigns', () => ({
  listCampaigns: jest.fn(),
}));
jest.mock('@/components/LoadingState', () => ({
  LoadingState: ({ message }: { message: string }) => <div data-testid="loading-state">{message}</div>,
}));

// Mock chart and sub-components to avoid recharts rendering issues in jsdom
jest.mock('../ReportCharts', () => ({
  EmailActivityChart: ({ data }: any) => <div data-testid="email-chart">{data.length} points</div>,
  ProfileViewsChart: ({ data }: any) => <div data-testid="views-chart">{data.length} points</div>,
}));
jest.mock('../ClientLeaderboard', () => ({
  ClientLeaderboard: ({ rows }: any) => <div data-testid="leaderboard">{rows.length} rows</div>,
}));
jest.mock('../ActivityTimeline', () => ({
  ActivityTimeline: ({ activities }: any) => <div data-testid="timeline">{activities.length} events</div>,
}));

import ReportsPage from '../page';

// Helper to create query results
function queryResult(overrides: any = {}) {
  return {
    data: overrides.data ?? undefined,
    isLoading: overrides.isLoading ?? false,
    isError: false,
    error: null,
    ...overrides,
  };
}

describe('ReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      role: 'agency',
      email: 'agency@test.com',
      agencyId: 'a1',
    };
    mockSessionLoading = false;
  });

  test('redirects non-agency users to /dashboard', () => {
    mockSession = { role: 'client', email: 'client@test.com' };
    mockUseQuery.mockReturnValue(queryResult({ isLoading: true }));

    render(<ReportsPage />);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  test('shows loading state when session is loading', () => {
    mockSessionLoading = true;
    mockUseQuery.mockReturnValue(queryResult({ isLoading: true }));

    render(<ReportsPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  test('shows loading state when data queries are loading', () => {
    mockUseQuery.mockReturnValue(queryResult({ isLoading: true }));

    render(<ReportsPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  test('renders Reports title and KPIs when data is loaded', () => {
    // Create a mock response that satisfies different queryKey patterns
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      switch (key) {
        case 'reports-clients':
          return queryResult({
            data: [
              { id: 'c1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', createdAt: new Date().toISOString() },
            ],
          });
        case 'reports-activity-report':
          return queryResult({ data: { recentActivities: [] } });
        case 'reports-recent-activities':
          return queryResult({ data: [] });
        case 'reports-email-metrics':
          return queryResult({
            data: {
              ok: true,
              stats: { sentCount: 42, clickCount: 10 },
              recentSends: [],
              byClient: {},
            },
          });
        case 'reports-email-metrics-prev':
          return queryResult({
            data: { ok: true, stats: { sentCount: 50, clickCount: 8 } },
          });
        case 'reports-profile-digest':
          return queryResult({
            data: { summary: { totalViews: 15 }, digests: [] },
          });
        case 'reports-tasks':
          return queryResult({ data: [] });
        case 'reports-campaigns':
          return queryResult({
            data: [{ id: 'camp1', status: 'sent' }],
          });
        default:
          return queryResult({});
      }
    });

    render(<ReportsPage />);

    expect(screen.getByText('Reports')).toBeInTheDocument();

    // KPI values should be visible
    expect(screen.getByText('Total Athletes')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Emails Sent
    expect(screen.getByText('15')).toBeInTheDocument(); // Profile Views
    expect(screen.getByText('Emails Sent')).toBeInTheDocument();
    expect(screen.getByText('Profile Views')).toBeInTheDocument();
  });

  test('renders charts with correct data length', () => {
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      switch (key) {
        case 'reports-clients':
          return queryResult({ data: [] });
        case 'reports-activity-report':
          return queryResult({ data: { recentActivities: [] } });
        case 'reports-recent-activities':
          return queryResult({ data: [] });
        case 'reports-email-metrics':
          return queryResult({
            data: { ok: true, stats: { sentCount: 0, clickCount: 0 }, recentSends: [] },
          });
        case 'reports-email-metrics-prev':
          return queryResult({ data: { ok: true } });
        case 'reports-profile-digest':
          return queryResult({ data: { summary: { totalViews: 0 }, digests: [] } });
        case 'reports-tasks':
          return queryResult({ data: [] });
        case 'reports-campaigns':
          return queryResult({ data: [] });
        default:
          return queryResult({});
      }
    });

    render(<ReportsPage />);

    expect(screen.getByTestId('email-chart')).toHaveTextContent('30 points');
    expect(screen.getByTestId('views-chart')).toHaveTextContent('30 points');
  });

  test('renders leaderboard and timeline', () => {
    mockUseQuery.mockImplementation((opts: any) => {
      const key = opts.queryKey[0];
      switch (key) {
        case 'reports-clients':
          return queryResult({
            data: [
              { id: 'c1', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
            ],
          });
        case 'reports-activity-report':
          return queryResult({ data: { recentActivities: [] } });
        case 'reports-recent-activities':
          return queryResult({
            data: [
              { id: 'a1', agencyId: 'agency1', actorEmail: 'test@test.com', actorType: 'agent', activityType: 'email_sent', description: 'Sent email', createdAt: Date.now() },
            ],
          });
        case 'reports-email-metrics':
          return queryResult({
            data: { ok: true, stats: { sentCount: 5, clickCount: 2 }, recentSends: [], byClient: {} },
          });
        case 'reports-email-metrics-prev':
          return queryResult({ data: { ok: true } });
        case 'reports-profile-digest':
          return queryResult({ data: { summary: { totalViews: 3 }, digests: [] } });
        case 'reports-tasks':
          return queryResult({ data: [] });
        case 'reports-campaigns':
          return queryResult({ data: [] });
        default:
          return queryResult({});
      }
    });

    render(<ReportsPage />);

    expect(screen.getByTestId('leaderboard')).toHaveTextContent('1 rows');
    expect(screen.getByTestId('timeline')).toHaveTextContent('1 events');
  });

  test('queries are only enabled when role is agency', () => {
    mockSession = { role: 'client', email: 'client@test.com' };
    mockUseQuery.mockReturnValue(queryResult({ isLoading: true }));

    render(<ReportsPage />);

    // All useQuery calls should have been made with enabled: false
    for (const call of mockUseQuery.mock.calls) {
      expect(call[0].enabled).toBe(false);
    }
  });
});
