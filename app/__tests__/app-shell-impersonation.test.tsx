import { render, screen, fireEvent } from '@testing-library/react';
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
import * as audit from '@/services/audit';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AppShell impersonation banner', () => {
  test('renders banner and can stop impersonation', () => {
    const setSession = jest.fn();
    // Seed base session in localStorage
    window.localStorage.setItem('session_impersonation_base', JSON.stringify({ role: 'parent', email: 'admin' }));
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({
      session: {
        role: 'agency',
        email: 'agency1@an.test',
        agencyId: 'agency-001',
        firstName: 'Agency',
        lastName: 'User',
        impersonatedBy: { email: 'admin', role: 'parent' },
      } as any,
      setSession,
      loading: false,
      refreshSession: jest.fn(),
    } as any);
    const endSpy = jest.spyOn(audit, 'logImpersonationEnd').mockReturnValue('id-end');
    render(<AppShell><div /></AppShell>, { wrapper: createWrapper() });

    // Updated: banner now says "You are viewing as:" instead of "You are impersonating agency account"
    expect(screen.getByText(/You are viewing as/i)).toBeInTheDocument();

    // Click "Stop Impersonating" button
    fireEvent.click(screen.getByRole('button', { name: /stop impersonating/i }));
    expect(endSpy).toHaveBeenCalledWith('admin', 'agency1@an.test');
    expect(setSession).toHaveBeenCalledWith(expect.objectContaining({ role: 'parent', email: 'admin' }));
  });
});
