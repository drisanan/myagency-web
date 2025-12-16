process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IntakeFormPageClient from '../[token]/page.client';

global.fetch = jest.fn();

describe('Intake form', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  test('renders agency theme, positions mapping, submits with decoded token', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, agency: { name: 'Prime', settings: { primaryColor: '#123456' } } }) }) // agency
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, id: 'sub1' }) }); // submit

    render(<IntakeFormPageClient token="token%20123" />);

    expect(await screen.findByText(/Prime/i)).toBeInTheDocument();

    // Sport select -> Football
    fireEvent.mouseDown(screen.getByLabelText(/^Sport$/i));
    fireEvent.click(await screen.findByRole('option', { name: 'Football' }));
    // Position select now has options
    fireEvent.mouseDown(screen.getByLabelText(/Preferred Position/i));
    fireEvent.click(await screen.findByRole('option', { name: 'QB' }));

    // Change sport to Swimming (no mapped positions -> freeform)
    fireEvent.mouseDown(screen.getByLabelText(/^Sport$/i));
    fireEvent.click(await screen.findByRole('option', { name: 'Swimming' }));
    fireEvent.change(screen.getByLabelText(/Preferred Position/i), { target: { value: 'Freestyle' } }); // freeform fallback

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pw' } });
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Doe' } });
    fireEvent.mouseDown(screen.getByLabelText(/Division/i));
    fireEvent.click(await screen.findByRole('option', { name: 'D1' }));
    fireEvent.mouseDown(screen.getByLabelText(/Graduation Year/i));
    fireEvent.click(await screen.findByRole('option', { name: '2026' }));

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    await waitFor(() => expect((fetch as jest.Mock).mock.calls.length).toBe(2));

    const submitCall = (fetch as jest.Mock).mock.calls[1];
    expect(submitCall[0]).toBe('https://api.test/forms/submit');
    expect(submitCall[1]?.body).toContain('token 123'); // decoded
    expect(await screen.findByText(/Submitted!/i)).toBeInTheDocument();
  });
});


