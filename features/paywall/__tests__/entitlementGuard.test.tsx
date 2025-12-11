import { render, screen } from '@testing-library/react';
import { TestProviders } from '@/tests/TestProviders';
import { EntitlementGuard } from '@/features/paywall/EntitlementGuard';
import * as svc from '@/features/paywall/service';

jest.spyOn(svc, 'getEntitlement');

function Child() {
  return <div>Premium Content</div>;
}

describe('EntitlementGuard', () => {
  test('renders children when entitled', async () => {
    (svc.getEntitlement as jest.Mock).mockResolvedValueOnce({ entitled: true });
    render(
      <TestProviders>
        <EntitlementGuard feature="premium"><Child /></EntitlementGuard>
      </TestProviders>
    );
    expect(await screen.findByText(/premium content/i)).toBeInTheDocument();
  });

  test('shows paywall fallback when not entitled', async () => {
    (svc.getEntitlement as jest.Mock).mockResolvedValueOnce({ entitled: false });
    render(
      <TestProviders>
        <EntitlementGuard feature="premium"><Child /></EntitlementGuard>
      </TestProviders>
    );
    expect(await screen.findByText(/upgrade to access/i)).toBeInTheDocument();
  });
});


