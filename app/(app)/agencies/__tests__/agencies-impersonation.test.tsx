import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AgenciesPage from '@/app/(app)/agencies/page';
import * as sessionMod from '@/features/auth/session';
import * as agencies from '@/services/agencies';
import * as audit from '@/services/audit';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('Agencies impersonation', () => {
  test('parent can impersonate agency and logs start', async () => {
    const setSession = jest.fn();
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({ session: { role: 'parent', email: 'admin' } as any, setSession, loading: false } as any);
    jest.spyOn(agencies, 'getAgencies').mockResolvedValue([{ id: 'agency-001', name: 'Prime', email: 'agency1@an.test', active: true } as any]);
    const logSpy = jest.spyOn(audit, 'logImpersonationStart').mockReturnValue('id1');
    render(<AgenciesPage />);
    expect(await screen.findByText(/Prime/i)).toBeInTheDocument();
    const button = await screen.findByRole('button', { name: /impersonate/i });
    fireEvent.click(button);
    expect(logSpy).toHaveBeenCalledWith('admin', 'agency1@an.test');
    expect(setSession).toHaveBeenCalledWith(expect.objectContaining({ role: 'agency', email: 'agency1@an.test', impersonatedBy: { email: 'admin', role: 'parent' } }));
  });
});


