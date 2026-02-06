/**
 * useImpersonation Hook Tests
 * TDD: Tests written first per engineering playbook
 */
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSetSession = jest.fn();
let mockSession: any = null;
jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: mockSession, setSession: mockSetSession }),
}));

const mockLogStart = jest.fn().mockReturnValue('audit-id-1');
const mockLogEnd = jest.fn().mockReturnValue('audit-id-2');
jest.mock('@/services/audit', () => ({
  logImpersonationStart: (...args: any[]) => mockLogStart(...args),
  logImpersonationEnd: (...args: any[]) => mockLogEnd(...args),
}));

import { useImpersonation } from '../useImpersonation';

describe('useImpersonation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = null;
    window.localStorage.clear();
  });

  describe('impersonateClient', () => {
    test('agency can impersonate their client', () => {
      // Setup: agency session
      mockSession = {
        role: 'agency',
        email: 'agency@example.com',
        agencyId: 'agency-123',
        agencyEmail: 'agency@example.com',
        firstName: 'Agency',
        lastName: 'Owner',
        agencySettings: { primaryColor: '#0A0A0A' },
        agencyLogo: 'https://logo.png',
      };

      const { result } = renderHook(() => useImpersonation());

      // Act: impersonate client
      act(() => {
        result.current.impersonateClient({
          id: 'client-456',
          email: 'athlete@example.com',
          firstName: 'John',
          lastName: 'Smith',
        });
      });

      // Assert: session switched to client role
      expect(mockSetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'client',
          email: 'athlete@example.com',
          clientId: 'client-456',
          agencyId: 'agency-123',
          agencyEmail: 'agency@example.com',
          firstName: 'John',
          lastName: 'Smith',
          impersonatedBy: { email: 'agency@example.com', role: 'agency' },
        })
      );

      // Assert: navigated to client portal
      expect(mockPush).toHaveBeenCalledWith('/client/lists');

      // Assert: original session saved to localStorage
      const saved = window.localStorage.getItem('session_impersonation_base');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toMatchObject({ role: 'agency', email: 'agency@example.com' });

      // Assert: audit logged
      expect(mockLogStart).toHaveBeenCalledWith('agency@example.com', 'athlete@example.com');
    });

    test('preserves agency settings and logo during impersonation', () => {
      mockSession = {
        role: 'agency',
        email: 'agency@example.com',
        agencyId: 'agency-123',
        agencySettings: { primaryColor: '#ff0000', secondaryColor: '#00ff00' },
        agencyLogo: 'https://custom-logo.png',
      };

      const { result } = renderHook(() => useImpersonation());

      act(() => {
        result.current.impersonateClient({
          id: 'client-789',
          email: 'jane@example.com',
        });
      });

      expect(mockSetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          agencySettings: { primaryColor: '#ff0000', secondaryColor: '#00ff00' },
          agencyLogo: 'https://custom-logo.png',
        })
      );
    });

    test('does nothing if not logged in as agency', () => {
      mockSession = null;

      const { result } = renderHook(() => useImpersonation());

      act(() => {
        result.current.impersonateClient({
          id: 'client-456',
          email: 'athlete@example.com',
        });
      });

      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('does nothing if already impersonating (no nested impersonation)', () => {
      mockSession = {
        role: 'agency',
        email: 'agency@example.com',
        agencyId: 'agency-123',
        impersonatedBy: { email: 'parent@example.com', role: 'parent' },
      };

      const { result } = renderHook(() => useImpersonation());

      act(() => {
        result.current.impersonateClient({
          id: 'client-456',
          email: 'athlete@example.com',
        });
      });

      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('does nothing if role is not agency', () => {
      mockSession = {
        role: 'client',
        email: 'client@example.com',
        clientId: 'client-123',
      };

      const { result } = renderHook(() => useImpersonation());

      act(() => {
        result.current.impersonateClient({
          id: 'client-456',
          email: 'another@example.com',
        });
      });

      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  describe('stopImpersonation', () => {
    test('restores original agency session', () => {
      // Setup: impersonated client session with base stored
      const originalSession = {
        role: 'agency',
        email: 'agency@example.com',
        agencyId: 'agency-123',
        firstName: 'Agency',
        lastName: 'Owner',
      };
      window.localStorage.setItem('session_impersonation_base', JSON.stringify(originalSession));

      mockSession = {
        role: 'client',
        email: 'athlete@example.com',
        clientId: 'client-456',
        impersonatedBy: { email: 'agency@example.com', role: 'agency' },
      };

      const { result } = renderHook(() => useImpersonation());

      // Act
      act(() => {
        result.current.stopImpersonation();
      });

      // Assert: original session restored
      expect(mockSetSession).toHaveBeenCalledWith(originalSession);

      // Assert: navigated back to clients list
      expect(mockPush).toHaveBeenCalledWith('/clients');

      // Assert: localStorage cleared
      expect(window.localStorage.getItem('session_impersonation_base')).toBeNull();

      // Assert: audit logged
      expect(mockLogEnd).toHaveBeenCalledWith('agency@example.com', 'athlete@example.com');
    });

    test('does nothing if no base session in localStorage', () => {
      mockSession = {
        role: 'client',
        email: 'athlete@example.com',
        impersonatedBy: { email: 'agency@example.com', role: 'agency' },
      };

      const { result } = renderHook(() => useImpersonation());

      act(() => {
        result.current.stopImpersonation();
      });

      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('does nothing if not impersonating', () => {
      window.localStorage.setItem('session_impersonation_base', JSON.stringify({ role: 'agency' }));

      mockSession = {
        role: 'agency',
        email: 'agency@example.com',
        // No impersonatedBy field
      };

      const { result } = renderHook(() => useImpersonation());

      act(() => {
        result.current.stopImpersonation();
      });

      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  describe('isImpersonating', () => {
    test('returns true when impersonatedBy is set', () => {
      mockSession = {
        role: 'client',
        impersonatedBy: { email: 'agency@example.com', role: 'agency' },
      };

      const { result } = renderHook(() => useImpersonation());

      expect(result.current.isImpersonating).toBe(true);
    });

    test('returns false when not impersonating', () => {
      mockSession = {
        role: 'agency',
        email: 'agency@example.com',
      };

      const { result } = renderHook(() => useImpersonation());

      expect(result.current.isImpersonating).toBe(false);
    });

    test('returns false when session is null', () => {
      mockSession = null;

      const { result } = renderHook(() => useImpersonation());

      expect(result.current.isImpersonating).toBe(false);
    });
  });

  describe('impersonatedBy', () => {
    test('returns impersonatedBy object when impersonating', () => {
      mockSession = {
        role: 'client',
        impersonatedBy: { email: 'agency@example.com', role: 'agency' },
      };

      const { result } = renderHook(() => useImpersonation());

      expect(result.current.impersonatedBy).toEqual({
        email: 'agency@example.com',
        role: 'agency',
      });
    });

    test('returns undefined when not impersonating', () => {
      mockSession = { role: 'agency' };

      const { result } = renderHook(() => useImpersonation());

      expect(result.current.impersonatedBy).toBeUndefined();
    });
  });
});

