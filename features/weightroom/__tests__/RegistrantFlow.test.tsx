import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import { RegistrantFlow } from '@/features/weightroom/RegistrantFlow';
import * as svc from '@/features/weightroom/service';

jest.spyOn(svc, 'register');
jest.spyOn(svc, 'getSessions');

describe('RegistrantFlow', () => {
  test('registers and loads sessions', async () => {
    (svc.register as jest.Mock).mockResolvedValueOnce({ ok: true });
    (svc.getSessions as jest.Mock).mockResolvedValueOnce([{ id: 's1', title: 'Bench' }]);
    render(
      <TestProviders>
        <RegistrantFlow />
      </TestProviders>
    );
    await userEvent.type(screen.getByLabelText(/name/i), 'User');
    await userEvent.type(screen.getByLabelText(/email/i), 'u@example.com');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(svc.register).toHaveBeenCalledWith({ name: 'User', email: 'u@example.com' });
    expect(await screen.findByText(/bench/i)).toBeInTheDocument();
  });
});


