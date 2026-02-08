import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Must mock next/navigation before importing AppShell
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/dashboard',
}));

jest.mock('@/features/suggestions', () => ({
  SuggestionButton: () => null,
}));

import { AppShell } from '@/app/app-shell';
import * as sessionMod from '@/features/auth/session';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AppShell navigation', () => {
  test('shows Agencies nav for parent', () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({
      session: { role: 'parent', email: 'admin' } as any,
      setSession: jest.fn(),
      loading: false,
      refreshSession: jest.fn(),
    } as any);
    render(<AppShell><div /></AppShell>, { wrapper: createWrapper() });
    expect(screen.getAllByText(/Agencies/i).length).toBeGreaterThanOrEqual(1);
  });

  test('hides Agencies nav for agency', () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({
      session: { role: 'agency', email: 'agency1@an.test', agencyId: 'agency-001' } as any,
      setSession: jest.fn(),
      loading: false,
      refreshSession: jest.fn(),
    } as any);
    render(<AppShell><div /></AppShell>, { wrapper: createWrapper() });
    expect(screen.queryAllByText(/Agencies/i)).toHaveLength(0);
  });
});
