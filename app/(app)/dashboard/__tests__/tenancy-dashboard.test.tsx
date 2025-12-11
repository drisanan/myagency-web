import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(app)/dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as sessionMod from '@/features/auth/session';
import * as clients from '@/services/clients';
import React from 'react';

function wrap(children: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Dashboard tenancy behavior', () => {
  test('agency dashboard queries by agency email', async () => {
    const spy = jest.spyOn(clients, 'listClientsByAgencyEmail').mockResolvedValue([
      { id: 'c-ag2-1', email: 'u@ag2.com', firstName: 'U', lastName: 'Two', sport: 'Baseball', agencyEmail: 'agency2@an.test' } as any,
    ]);
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({
      session: { role: 'agency', email: 'agency2@an.test' } as any,
      setSession: jest.fn(),
      loading: false,
    } as any);
    render(wrap(<DashboardPage />));
    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith('agency2@an.test');
  });
});


