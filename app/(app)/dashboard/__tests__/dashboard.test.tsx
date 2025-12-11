import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(app)/dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as sessionMod from '@/features/auth/session';
import * as agencies from '@/services/agencies';
import * as clients from '@/services/clients';

function wrap(children: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Dashboard', () => {
  test('renders agencies for parent', async () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({ session: { role: 'parent', email: 'admin' } as any, setSession: jest.fn(), loading: false } as any);
    jest.spyOn(agencies, 'listAgencies').mockResolvedValue([{ id: 'a1', name: 'Prime Sports' }]);
    render(wrap(<DashboardPage />));
    expect(await screen.findByText(/Prime Sports/i)).toBeInTheDocument();
  });

  test('renders agency metrics cards', async () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test', agencyId: 'agency-001' } as any, setSession: jest.fn(), loading: false } as any);
    jest.spyOn(clients, 'listClientsByAgencyEmail').mockResolvedValue([{ id: 'c1', email: 'e@x.com', firstName: 'A', lastName: 'B', sport: 'Football', agencyEmail: 'agency1@an.test' } as any]);
    render(wrap(<DashboardPage />));
    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Emails Sent/i)).toBeInTheDocument();
    expect(await screen.findByText(/Open Rate/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total Athletes/i)).toBeInTheDocument();
  });
});


