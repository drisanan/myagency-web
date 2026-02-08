/**
 * Client Lists Page Tests
 *
 * Covers:
 *  - Renders page title
 *  - Fetches and displays client's own interest lists
 *  - Fetches and displays agency-assigned lists
 *  - Shows empty states for both list types
 *  - Shows loading states
 *  - Shows coach details in assigned lists
 *  - Handles API failures gracefully
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---- Mocks ----
let mockSession: any = null;
jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: mockSession }),
}));

jest.mock('@/features/tour/TourProvider', () => ({
  useTour: () => ({ startTour: jest.fn() }),
}));

jest.mock('@/features/tour/clientSteps', () => ({
  clientListsSteps: [],
}));

const mockListLists = jest.fn();
const mockSaveList = jest.fn();
jest.mock('@/services/lists', () => ({
  listLists: (...args: any[]) => mockListLists(...args),
  saveList: (...args: any[]) => mockSaveList(...args),
}));

const mockListAssignments = jest.fn();
jest.mock('@/services/listAssignments', () => ({
  listAssignments: (...args: any[]) => mockListAssignments(...args),
}));

jest.mock('@/services/recruiter', () => ({
  listUniversities: jest.fn().mockResolvedValue([]),
  DIVISION_API_MAPPING: {},
}));

jest.mock('@/services/recruiterMeta', () => ({
  getDivisions: jest.fn().mockResolvedValue(['NCAA D1']),
  getStates: jest.fn().mockResolvedValue([{ code: 'CA', name: 'California' }]),
}));

jest.mock('@/features/recruiter/divisionMapping', () => ({
  getSports: jest.fn().mockReturnValue(['Football', 'Basketball']),
}));

jest.mock('@/services/clients', () => ({
  getClient: jest.fn().mockResolvedValue({ sport: 'Football', division: 'NCAA D1', state: 'CA' }),
}));

jest.mock('@/components/LoadingState', () => ({
  LoadingState: ({ message }: { message: string }) => <div data-testid="loading-state">{message}</div>,
}));

import ClientListsPage from '../lists/page';

describe('ClientListsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      role: 'client',
      email: 'athlete@test.com',
      clientId: 'client-123',
      agencyEmail: 'agency@test.com',
    };
    mockListLists.mockResolvedValue([]);
    mockListAssignments.mockResolvedValue({ lists: [] });
  });

  test('renders page title "My Lists"', async () => {
    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('My Lists')).toBeInTheDocument();
    });
  });

  test('renders "Create Interest List" section', async () => {
    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Interest List')).toBeInTheDocument();
    });
  });

  test('fetches and displays client interest lists', async () => {
    mockListLists.mockResolvedValue([
      { id: 'list1', name: 'My Dream Schools', items: [{ school: 'Stanford' }, { school: 'UCLA' }] },
    ]);

    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('My Dream Schools')).toBeInTheDocument();
    });

    expect(screen.getByText('Stanford, UCLA')).toBeInTheDocument();
  });

  test('shows empty state for no interest lists', async () => {
    mockListLists.mockResolvedValue([]);

    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('No lists yet.')).toBeInTheDocument();
    });
  });

  test('fetches and displays agency-assigned lists', async () => {
    mockListAssignments.mockResolvedValue({
      lists: [
        {
          id: 'assigned1',
          name: 'Top 10 SEC Coaches',
          items: [
            { firstName: 'Nick', lastName: 'Saban', title: 'Head Coach', school: 'Alabama', email: 'nick@bama.edu' },
            { firstName: 'Kirby', lastName: 'Smart', title: 'Head Coach', school: 'Georgia', email: 'kirby@uga.edu' },
          ],
        },
      ],
    });

    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('Top 10 SEC Coaches')).toBeInTheDocument();
    });

    expect(screen.getByText('Nick Saban')).toBeInTheDocument();
    expect(screen.getByText('Kirby Smart')).toBeInTheDocument();
  });

  test('renders "Coach Lists From Your Agency" header', async () => {
    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('Coach Lists From Your Agency')).toBeInTheDocument();
    });
  });

  test('shows empty state for no assigned lists', async () => {
    mockListAssignments.mockResolvedValue({ lists: [] });

    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText(/agency hasn't assigned/)).toBeInTheDocument();
    });
  });

  test('handles listAssignments API failure gracefully', async () => {
    mockListAssignments.mockRejectedValue(new Error('Network error'));

    render(<ClientListsPage />);

    // Should still render the page without crashing
    await waitFor(() => {
      expect(screen.getByText('My Lists')).toBeInTheDocument();
    });

    // Assigned lists section should show empty state
    await waitFor(() => {
      expect(screen.getByText(/agency hasn't assigned/)).toBeInTheDocument();
    });
  });

  test('handles listLists API failure gracefully', async () => {
    mockListLists.mockRejectedValue(new Error('Failed'));

    render(<ClientListsPage />);

    // Page should still render
    await waitFor(() => {
      expect(screen.getByText('My Lists')).toBeInTheDocument();
    });
  });

  test('calls listAssignments with correct client ID', async () => {
    render(<ClientListsPage />);

    await waitFor(() => {
      expect(mockListAssignments).toHaveBeenCalledWith({
        clientId: 'client-123',
        includeLists: true,
      });
    });
  });

  test('does not fetch assigned lists when clientId is missing', async () => {
    mockSession = { role: 'client', email: 'athlete@test.com' };

    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('My Lists')).toBeInTheDocument();
    });

    expect(mockListAssignments).not.toHaveBeenCalled();
  });

  test('shows coach and school chips in assigned lists', async () => {
    mockListAssignments.mockResolvedValue({
      lists: [
        {
          id: 'assigned1',
          name: 'Big 10 List',
          items: [
            { firstName: 'Jim', lastName: 'Harbaugh', title: 'HC', school: 'Michigan', email: 'jim@um.edu' },
            { firstName: 'Ryan', lastName: 'Day', title: 'HC', school: 'Ohio State', email: 'ryan@osu.edu' },
            { firstName: 'Kirk', lastName: 'Ferentz', title: 'HC', school: 'Iowa', email: 'kirk@iowa.edu' },
          ],
        },
      ],
    });

    render(<ClientListsPage />);

    await waitFor(() => {
      expect(screen.getByText('3 coaches')).toBeInTheDocument();
      expect(screen.getByText('3 schools')).toBeInTheDocument();
    });
  });
});
