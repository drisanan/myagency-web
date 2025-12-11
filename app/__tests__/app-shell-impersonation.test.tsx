import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppShell } from '@/app/app-shell';
import * as sessionMod from '@/features/auth/session';
import * as audit from '@/services/audit';

describe('AppShell impersonation banner', () => {
  test('renders banner and can stop impersonation', () => {
    const setSession = jest.fn();
    // Seed base session in localStorage
    window.localStorage.setItem('session_impersonation_base', JSON.stringify({ role: 'parent', email: 'admin' }));
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({
      session: { role: 'agency', email: 'agency1@an.test', agencyId: 'agency-001', impersonatedBy: { email: 'admin', role: 'parent' } } as any,
      setSession,
      loading: false
    } as any);
    const endSpy = jest.spyOn(audit, 'logImpersonationEnd').mockReturnValue('id-end');
    render(<AppShell><div /></AppShell>);
    expect(screen.getByText(/You are impersonating agency account/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /stop impersonating/i }));
    expect(endSpy).toHaveBeenCalledWith('admin', 'agency1@an.test');
    expect(setSession).toHaveBeenCalledWith(expect.objectContaining({ role: 'parent', email: 'admin' }));
  });
});


