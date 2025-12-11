import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppShell } from '@/app/app-shell';
import * as sessionMod from '@/features/auth/session';

describe('AppShell navigation', () => {
  test('shows Agencies nav for parent', () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({ session: { role: 'parent', email: 'admin' } as any, setSession: jest.fn(), loading: false } as any);
    render(<AppShell><div /></AppShell>);
    expect(screen.getByText(/Agencies/i)).toBeInTheDocument();
  });

  test('hides Agencies nav for agency', () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test', agencyId: 'agency-001' } as any, setSession: jest.fn(), loading: false } as any);
    render(<AppShell><div /></AppShell>);
    expect(screen.queryByText(/Agencies/i)).toBeNull();
  });
});


