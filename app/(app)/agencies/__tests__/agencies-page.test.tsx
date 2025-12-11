import { render, screen } from '@testing-library/react';
import React from 'react';
import AgenciesPage from '@/app/(app)/agencies/page';
import * as sessionMod from '@/features/auth/session';
import * as agencies from '@/services/agencies';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('Agencies page', () => {
  test('shows Agencies list with New button for parent', async () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({ session: { role: 'parent', email: 'admin' } as any, setSession: jest.fn(), loading: false } as any);
    jest.spyOn(agencies, 'getAgencies').mockResolvedValue([{ id: 'a1', name: 'Prime', email: 'a@x.com', active: true } as any]);
    render(<AgenciesPage />);
    expect(await screen.findByRole('link', { name: /new agency/i })).toBeInTheDocument();
    expect(await screen.findByText(/Prime/i)).toBeInTheDocument();
  });
});


