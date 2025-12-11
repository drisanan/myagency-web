import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import * as svc from '@/features/settings/service';
import { SettingsForm } from '@/features/settings/SettingsForm';

jest.spyOn(svc, 'updateProfile');

describe('SettingsForm', () => {
  test('validates and submits', async () => {
    (svc.updateProfile as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(
      <TestProviders>
        <SettingsForm />
      </TestProviders>
    );
    await userEvent.type(screen.getByLabelText(/name/i), 'User');
    await userEvent.type(screen.getByLabelText(/email/i), 'u@example.com');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(svc.updateProfile).toHaveBeenCalledWith({ name: 'User', email: 'u@example.com' });
  });
});


