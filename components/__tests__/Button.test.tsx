import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantThemeProvider } from '@/tenancy/TenantThemeProvider';
import { Button } from '@/components/Button';
import { getTenantRegistry } from '@/config';

describe('Button', () => {
  test('renders and invokes onClick', async () => {
    const user = userEvent.setup();
    const reg = getTenantRegistry();
    const tenant = reg.default;
    const handleClick = jest.fn();

    render(
      <TenantThemeProvider tenant={tenant}>
        <Button onClick={handleClick} label="Click me" />
      </TenantThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});


