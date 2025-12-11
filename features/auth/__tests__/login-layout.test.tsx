import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/auth/login/page';
import { Providers } from '@/app/providers';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}));

describe('Login page layout and validation', () => {
  test('renders centered white login card', () => {
    render(<Providers><LoginPage /></Providers>);
    expect(screen.getByTestId('login-card')).toBeInTheDocument();
  });

  test('shows error list when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<Providers><LoginPage /></Providers>);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const errorList = await screen.findByTestId('error-list');
    expect(errorList).toBeInTheDocument();
    expect(errorList).toHaveTextContent(/Email: Required/i);
    expect(errorList).toHaveTextContent(/Phone: Required/i);
    expect(errorList).toHaveTextContent(/Access Code: Required/i);
    expect(pushMock).not.toHaveBeenCalled();
  });
});


