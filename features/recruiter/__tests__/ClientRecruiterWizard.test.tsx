import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientRecruiterWizard } from '@/features/recruiter/ClientRecruiterWizard';
import * as sess from '@/features/auth/session';
import * as clients from '@/services/clients';
import * as assignments from '@/services/listAssignments';

describe('ClientRecruiterWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(sess, 'useSession').mockReturnValue({
      session: {
        role: 'client',
        clientId: 'client-1',
        email: 'athlete@example.com',
        agencyEmail: 'agency@example.com',
      } as any,
      loading: false,
      setSession: jest.fn(),
    } as any);

    jest.spyOn(clients, 'getClient').mockResolvedValue({
      id: 'client-1',
      email: 'athlete@example.com',
      firstName: 'Jordan',
      lastName: 'Miles',
      phone: '555-1212',
      sport: 'Football',
      username: 'jordan-miles',
      accessCodeHash: 'hash',
      radar: {
        school: 'Central High',
        profileImage: 'https://example.com/photo.jpg',
        accomplishments: ['All-Region'],
      },
    } as any);

    jest.spyOn(assignments, 'listAssignments').mockResolvedValue({
      lists: [
        {
          id: 'list-1',
          name: 'Assigned List',
          items: [
            {
              id: 'coach-1',
              firstName: 'Ada',
              lastName: 'Lovelace',
              email: 'ada@u.test',
              school: 'Test U',
              title: 'Head Coach',
            },
          ],
        },
      ],
    } as any);
  });

  test('keeps editor empty when a user clears it', async () => {
    const user = userEvent.setup();
    (global as any).fetch = jest.fn(async () =>
      new Response(JSON.stringify({ connected: true, canRefresh: true, email: 'athlete@example.com' }), {
        status: 200,
      })
    );

    render(<ClientRecruiterWizard />);

    await user.click(await screen.findByLabelText(/select list/i));
    await user.click(await screen.findByText(/assigned list/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(await screen.findByLabelText(/ada lovelace/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(screen.getByRole('button', { name: /^edit$/i }));
    const editor = screen.getByRole('textbox');
    await user.clear(editor);

    expect(editor).toHaveValue('');
  });

  test('sends email requests with session credentials', async () => {
    const user = userEvent.setup();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ connected: true, canRefresh: true, email: 'athlete@example.com' }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    (global as any).fetch = fetchMock;

    render(<ClientRecruiterWizard />);

    await user.click(await screen.findByLabelText(/select list/i));
    await user.click(await screen.findByText(/assigned list/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(await screen.findByLabelText(/ada lovelace/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    jest.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(await screen.findByRole('button', { name: /send email/i }));

    const sendCall = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
    expect(sendCall).toBeTruthy();
    expect((sendCall?.[1] as RequestInit | undefined)?.credentials).toBe('include');
  });
});
