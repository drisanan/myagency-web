import { render, screen, waitFor } from '@testing-library/react';
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
  const originalFetch = global.fetch;
  const originalOpen = window.open;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/google/oauth/url')) {
        return new Response(JSON.stringify({ url: 'https://oauth.example.test' }), { status: 200 });
      }
      if (url.includes('/google/tokens')) {
        return new Response(JSON.stringify({ ok: true, tokens: { accessToken: 'token' } }), { status: 200 });
      }
      if (url.includes('/google/status')) {
        return new Response(JSON.stringify({ connected: true, canRefresh: true, email: 'athlete1@example.com' }), { status: 200 });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as any;
    window.open = jest.fn(() => ({ close: jest.fn() } as any));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.open = originalOpen;
  });

  async function connectGmail(user: ReturnType<typeof userEvent.setup>, clientId = 'temp-test-client') {
    await user.click(screen.getByRole('button', { name: /connect gmail account/i }));
    window.dispatchEvent(new MessageEvent('message', {
      origin: window.location.origin,
      data: { type: 'google-oauth-success', clientId },
    }));
    await waitFor(() => {
      expect(screen.getByText(/connected:/i)).toBeInTheDocument();
    });
  }

  test('creates client with canonical media and radar fields', async () => {
    jest.spyOn(sess, 'useSession').mockReturnValue({ session: { role: 'agency', email: 'agency1@an.test' } as any, setSession: jest.fn(), loading: false } as any);
    const spy = jest.spyOn(clients, 'upsertClient').mockResolvedValue({ id: 'new-id' } as any);
    const user = userEvent.setup();
    render(wrap(<ClientWizard />));
    await user.type(screen.getByLabelText(/athlete email/i), 'athlete1@example.com');
    await user.type(screen.getByLabelText(/access code/i), '123456');
    await user.type(screen.getByLabelText(/first name/i), 'Ava');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.type(screen.getByLabelText(/phone/i), '12345678901');
    await user.click(screen.getByLabelText(/sport/i));
    await user.click(await screen.findByText('Football'));
    await user.click(screen.getByRole('button', { name: /set via url/i }));
    await user.type(screen.getByLabelText(/profile image url/i), 'http://example.com/img.png');
    await connectGmail(user);
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByLabelText(/Preferred Position/i), 'Forward');
    await user.click(screen.getByRole('button', { name: /next/i })); // personal -> social
    await user.click(screen.getByRole('button', { name: /next/i })); // social -> content
    await user.click(screen.getByRole('button', { name: /next/i })); // content -> gallery
    await user.click(screen.getByRole('button', { name: /next/i })); // gallery -> events/metrics
    await user.click(screen.getByRole('button', { name: /\+ add event/i }));
    await user.type(screen.getByLabelText(/Event Name/i), 'Camp');
    await user.type(screen.getByLabelText(/Start Time/i), '2025-02-01T10:00');
    await user.click(screen.getByRole('button', { name: /\+ add metric/i }));
    await user.type(screen.getByLabelText(/Metric Title/i), '40yd');
    await user.type(screen.getByLabelText(/Metric Value/i), '4.5s');
    await user.click(screen.getByRole('button', { name: /next/i })); // to motivation/references
    await user.click(screen.getByRole('button', { name: /\+ add reference/i }));
    await user.type(screen.getByLabelText(/Name/i), 'Coach K');
    await user.type(screen.getByLabelText(/Email/i), 'coach@example.com');
    await user.type(screen.getByLabelText(/Phone/i), '123-456');
    await user.click(screen.getByRole('button', { name: /next/i })); // review
    await user.click(screen.getByRole('button', { name: /Create Client/i }));
    expect(spy).toHaveBeenCalled();
    const arg = (spy.mock.calls[0] as any[])[0];
    expect(arg).toMatchObject({
      email: 'athlete1@example.com',
      agencyEmail: 'agency1@an.test',
    });
    expect(arg.radar.preferredPosition).toBe('Forward');
    expect(arg.radar.events?.[0]).toMatchObject({ name: 'Camp', startTime: '2025-02-01T10:00' });
    expect(arg.radar.metrics?.[0]).toMatchObject({ title: '40yd', value: '4.5s' });
    expect(arg.radar.references?.[0]).toMatchObject({ name: 'Coach K', email: 'coach@example.com', phone: '123-456' });
    expect(arg.photoUrl).toBe('http://example.com/img.png');
    expect(arg.profileImageUrl).toBe('http://example.com/img.png');
    expect(push).toHaveBeenCalledWith('/clients');
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
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/access code is required/i)).toBeInTheDocument();
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
      authEnabled: true,
      radar: { preferredPosition: 'WR' },
    };
    render(wrap(<ClientWizard initialClient={initial} mode="edit" />));

    // pre-populated fields
    expect(screen.getByDisplayValue('editme@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Me')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Set via URL/i }));
    await user.clear(screen.getByLabelText(/Profile Image URL/i));
    await user.type(screen.getByLabelText(/Profile Image URL/i), 'http://example.com/new.png');
    // advance to radar step and edit
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.clear(screen.getByLabelText(/Preferred Position/i));
    await user.type(screen.getByLabelText(/Preferred Position/i), 'Slot');
    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }));
    }
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
  }, 15000);

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
      authEnabled: true,
    };
    render(wrap(<ClientWizard initialClient={initial} mode="edit" />));

    // Clear required field and attempt to proceed
    await user.clear(screen.getByLabelText(/First name/i));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });
});


