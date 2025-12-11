import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientWizard } from '@/features/clients/ClientWizard';
import * as sess from '@/features/auth/session';
import * as clients from '@/services/clients';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

function wrap(children: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('ClientWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates client with aggregated radar fields', async () => {
    jest.spyOn(sess, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test' } as any, setSession: jest.fn(), loading: false } as any);
    const spy = jest.spyOn(clients, 'upsertClient').mockResolvedValue({ id: 'new-id' } as any);
    const user = userEvent.setup();
    render(wrap(<ClientWizard />));
    await user.type(screen.getByLabelText(/athlete email/i), 'athlete1@example.com');
    await user.type(screen.getByLabelText(/athlete password/i), 'password123');
    await user.type(screen.getByLabelText(/first name/i), 'Ava');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.click(screen.getByLabelText(/sport/i));
    await user.click(await screen.findByText('Football'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByLabelText(/Preferred Position/i), 'Forward');
    // advance through remaining steps quickly
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }));
    }
    await user.click(screen.getByRole('button', { name: /next/i })); // go to Review
    await user.click(screen.getByRole('button', { name: /Create Client/i }));
    expect(spy).toHaveBeenCalled();
    const arg = (spy.mock.calls[0] as any[])[0];
    expect(arg).toMatchObject({
      email: 'athlete1@example.com',
      agencyEmail: 'agency1@an.test',
    });
    expect(arg.radar.preferredPosition).toBe('Forward');
    expect(push).toHaveBeenCalledWith('/clients');
  });
 
   test('renders styled review summary (not raw JSON)', async () => {
     jest.spyOn(sess, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test' } as any, setSession: jest.fn(), loading: false } as any);
     const user = userEvent.setup();
     render(wrap(<ClientWizard />));
     await user.type(screen.getByLabelText(/athlete email/i), 'athlete2@example.com');
    await user.type(screen.getByLabelText(/first name/i), 'Chris');
    await user.type(screen.getByLabelText(/last name/i), 'Lee');
    await user.click(screen.getByLabelText(/sport/i));
    await user.click(await screen.findByText('Football'));
     for (let i = 0; i < 6; i++) {
       await user.click(screen.getByRole('button', { name: /next/i }));
     }
     expect(screen.getByText(/Sport:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Personal/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Social/i).length).toBeGreaterThan(0);
     expect(screen.queryByText(/^{/)).not.toBeInTheDocument();
   });

  test('shows required field errors when missing basic info', async () => {
    jest.spyOn(sess, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test' } as any, setSession: jest.fn(), loading: false } as any);
    const spy = jest.spyOn(clients, 'upsertClient').mockResolvedValue({ id: 'new-id' } as any);
    const user = userEvent.setup();
    render(wrap(<ClientWizard />));

    // Try to advance from step 0 without required fields
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/please fill all required fields/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/sport is required/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();

    // Fill one field and ensure errors update
    await user.type(screen.getByLabelText(/athlete email/i), 'someone@example.com');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  test('allows editing an existing client and preserves id/agency, omits blank password', async () => {
    jest.spyOn(sess, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test' } as any, setSession: jest.fn(), loading: false } as any);
    const spy = jest.spyOn(clients, 'upsertClient').mockResolvedValue({ id: 'ag1-c1' } as any);
    const user = userEvent.setup();
    const initial = {
      id: 'ag1-c1',
      email: 'editme@example.com',
      firstName: 'Edit',
      lastName: 'Me',
      sport: 'Football',
      agencyEmail: 'agency1@an.test',
      profileImageUrl: 'http://example.com/old.png',
      radar: { preferredPosition: 'WR' },
    };
    render(wrap(<ClientWizard initialClient={initial} mode="edit" />));

    // pre-populated fields
    expect(screen.getByDisplayValue('editme@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Me')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Profile Image URL/i));
    await user.type(screen.getByLabelText(/Profile Image URL/i), 'http://example.com/new.png');
    // advance to radar step and edit
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.clear(screen.getByLabelText(/Preferred Position/i));
    await user.type(screen.getByLabelText(/Preferred Position/i), 'Slot');
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }));
    }
    await user.click(screen.getByRole('button', { name: /next/i })); // Review
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(spy).toHaveBeenCalled();
    const arg = (spy.mock.calls[0] as any[])[0];
    expect(arg.id).toBe('ag1-c1');
    expect(arg.agencyEmail).toBe('agency1@an.test');
    expect(arg.password).toBeUndefined();
    expect(arg.radar.preferredPosition).toBe('Slot');
    expect(arg.photoUrl).toBe('http://example.com/new.png');
    expect(arg.profileImageUrl).toBe('http://example.com/new.png');
  });

  test('edit mode still enforces required fields if cleared', async () => {
    jest.spyOn(sess, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test' } as any, setSession: jest.fn(), loading: false } as any);
    const spy = jest.spyOn(clients, 'upsertClient').mockResolvedValue({ id: 'ag1-c1' } as any);
    const user = userEvent.setup();
    const initial = {
      id: 'ag1-c1',
      email: 'editme@example.com',
      firstName: 'Edit',
      lastName: 'Me',
      sport: 'Football',
      agencyEmail: 'agency1@an.test',
    };
    render(wrap(<ClientWizard initialClient={initial} mode="edit" />));

    // Clear required field and attempt to proceed
    await user.clear(screen.getByLabelText(/First name/i));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });
});


