/**
 * Client Layout Tests
 *
 * Critical: Tests the Guard component and impersonation UI in the client portal.
 *
 * Covers:
 *  - Guard redirects unauthenticated users to login
 *  - Guard redirects non-client users to /clients
 *  - Guard shows loading while session is loading
 *  - Impersonation banner displays when impersonating
 *  - Stop impersonation button works
 *  - Navigation items render correctly
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---- Mocks ----
const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = '/client/lists';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => mockPathname,
}));

let mockSession: any = null;
let mockSessionLoading = false;
const mockSetSession = jest.fn();
jest.mock('@/features/auth/session', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({
    session: mockSession,
    loading: mockSessionLoading,
    setSession: mockSetSession,
  }),
}));

jest.mock('@/features/tour/TourProvider', () => ({
  TourProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/features/theme/DynamicThemeProvider', () => ({
  DynamicThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockStopImpersonation = jest.fn();
let mockIsImpersonating = false;
jest.mock('@/hooks/useImpersonation', () => ({
  useImpersonation: () => ({
    isImpersonating: mockIsImpersonating,
    stopImpersonation: mockStopImpersonation,
    impersonatedBy: mockIsImpersonating
      ? { email: 'agency@test.com', role: 'agency' }
      : undefined,
  }),
}));

const mockInvalidateQueries = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    clear: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>;
});

// We need to import layout's inner components, but the default export wraps with providers.
// Let's test by importing the file and rendering the layout with mock children.
import ClientLayout from '../layout';

describe('Client Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      role: 'client',
      email: 'athlete@test.com',
      clientId: 'client-123',
      firstName: 'John',
      lastName: 'Doe',
    };
    mockSessionLoading = false;
    mockIsImpersonating = false;
    mockPathname = '/client/lists';
  });

  test('renders loading state when session is loading', () => {
    mockSessionLoading = true;
    mockSession = null;

    render(
      <ClientLayout>
        <div>Child Content</div>
      </ClientLayout>
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
  });

  test('redirects unauthenticated user to login', () => {
    mockSession = null;

    render(
      <ClientLayout>
        <div>Child Content</div>
      </ClientLayout>
    );

    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  test('redirects non-client user to /clients', () => {
    mockSession = { role: 'agency', email: 'agency@test.com' };

    render(
      <ClientLayout>
        <div>Child Content</div>
      </ClientLayout>
    );

    expect(mockReplace).toHaveBeenCalledWith('/clients');
  });

  test('renders children for authenticated client', async () => {
    render(
      <ClientLayout>
        <div>Child Content</div>
      </ClientLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  test('renders navigation items', async () => {
    render(
      <ClientLayout>
        <div>Content</div>
      </ClientLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    // Nav items should be present
    expect(screen.getAllByText('Lists').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tasks').length).toBeGreaterThanOrEqual(1);
  });

  test('shows impersonation banner when impersonating', async () => {
    mockIsImpersonating = true;

    render(
      <ClientLayout>
        <div>Content</div>
      </ClientLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    // Should show "End" button
    const endButtons = screen.getAllByText('End');
    expect(endButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('stop impersonation button calls stopImpersonation', async () => {
    mockIsImpersonating = true;

    render(
      <ClientLayout>
        <div>Content</div>
      </ClientLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    // Find and click "Stop Impersonating" button
    const stopBtn = screen.getByText('Stop Impersonating');
    fireEvent.click(stopBtn);

    expect(mockStopImpersonation).toHaveBeenCalledTimes(1);
  });
});
