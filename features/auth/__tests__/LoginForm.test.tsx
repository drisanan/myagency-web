import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantThemeProvider } from '@/tenancy/TenantThemeProvider';
import { getTenantRegistry } from '@/config';
import { LoginForm } from '@/features/auth/LoginForm';

describe('LoginForm', () => {
  test('shows validation errors and calls onSubmit when valid', async () => {
    const user = userEvent.setup();
    const tenant = getTenantRegistry().default;
    const onSubmit = jest.fn(async () => {});

    render(
      <TenantThemeProvider tenant={tenant}>
        <LoginForm onSubmit={onSubmit} />
      </TenantThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const list = await screen.findByTestId('error-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveTextContent(/Email: Required/i);
    expect(list).toHaveTextContent(/Phone: Required/i);
    expect(list).toHaveTextContent(/Access Code: Required/i);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/phone/i), '5551231234');
    await user.type(screen.getByLabelText(/access code/i), '999999');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', phone: '5551231234', accessCode: '999999' });
  });
});


