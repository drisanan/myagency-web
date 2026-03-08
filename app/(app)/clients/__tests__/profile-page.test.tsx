import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientProfilePage from '@/app/(app)/clients/[id]/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: 'c1' })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn(() => null) })),
}));

jest.mock('@/services/clients', () => ({
  getClient: jest.fn(async () => ({
    id: 'c1',
    firstName: 'Ava',
    lastName: 'Smith',
    sport: 'Football',
    profileImageUrl: '/avatar.png',
  })),
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(() => ({
    session: { agencyEmail: 'agency@test.com', email: 'agency@test.com' },
    loading: false,
  })),
}));

jest.mock('@/services/lists', () => ({
  listLists: jest.fn(async () => []),
}));

jest.mock('@/services/emailTracking', () => ({
  fetchEmailMetrics: jest.fn(async () => ({
    ok: true,
    stats: { sentCount: 1, openCount: 1, clickCount: 1, uniqueClickers: 1 },
    recentSends: [{ recipientEmail: 'coach@test.com', recipientName: 'Coach Lee', subject: 'Intro', university: 'State U', sentAt: 1710000000000 }],
    recentOpens: [{ recipientEmail: 'coach@test.com', university: 'State U', openedAt: 1710000001000 }],
    recentClicks: [{ recipientEmail: 'coach@test.com', destination: 'https://example.com', clickedAt: 1710000002000 }],
  })),
}));

jest.mock('@/features/notes/NotesPanel', () => ({ NotesPanel: () => <div>Notes Panel</div> }));
jest.mock('@/features/tasks/TasksPanel', () => ({ TasksPanel: () => <div>Tasks Panel</div> }));
jest.mock('@/features/coachNotes', () => ({ CoachNotesPanel: () => <div>Coach Notes Panel</div> }));
jest.mock('@/features/communications', () => ({ CommunicationsPanel: () => <div>Communications Panel</div> }));
jest.mock('@/features/profileViews', () => ({ ProfileViewsPanel: () => <div>Profile Views Panel</div> }));
jest.mock('@/features/meetings', () => ({ MeetingsPanel: () => <div>Meetings Panel</div> }));
jest.mock('@/features/activity', () => ({ ActivityReportPanel: () => <div>Activity Panel</div> }));
jest.mock('@/features/accountStatus', () => ({ AccountStatusPanel: () => <div>Account Panel</div> }));

function wrap(ui: React.ReactElement) {
  return <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>;
}

describe('ClientProfilePage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ connected: true, canRefresh: true, email: 'athlete@test.com' }), { status: 200 })) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('renders profile header and engagement timeline', async () => {
    render(wrap(<ClientProfilePage />));

    expect(await screen.findByText(/Ava Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Football/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
    expect(screen.getByText(/Last 30 Days/i)).toBeInTheDocument();
    expect(screen.getByText(/Intro/i)).toBeInTheDocument();
    expect(screen.getByText(/Email opened/i)).toBeInTheDocument();
    expect(screen.getByText(/Link clicked/i)).toBeInTheDocument();
  });
});

