import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/auth/login/page';
import { Providers } from '@/app/providers';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}));

jest.mock('@/services/authGHL', () => ({
  loginWithGHL: jest.fn(async (email: string, phone: string, access: string) => ({
    ok: true,
    contact: { email, id: 'contact-1' },
  })),
}));

jest.mock('@/services/agencies', () => ({
  getAgencyByEmail: jest.fn(async () => ({ id: 'agency-1' })),
}));

describe('Login flow', () => {
  test('valid email/phone/access navigates to /dashboard', async () => {
    const user = userEvent.setup();
    render(<Providers><LoginPage /></Providers>);
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/phone/i), '2084407940');
    await user.type(screen.getByLabelText(/access code/i), '123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});


