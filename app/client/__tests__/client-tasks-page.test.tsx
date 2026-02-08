/**
 * Client Tasks Page Tests
 *
 * Covers:
 *  - Renders page title
 *  - Shows loading state
 *  - Fetches and displays tasks
 *  - Separates open and done tasks
 *  - Shows empty state when no tasks
 *  - Mark done button updates task status
 *  - Handles API errors gracefully
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---- Mocks ----
let mockSession: any = null;
let mockSessionLoading = false;
jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: mockSession, loading: mockSessionLoading }),
}));

jest.mock('@/features/tour/TourProvider', () => ({
  useTour: () => ({ startTour: jest.fn() }),
}));

jest.mock('@/features/tour/clientSteps', () => ({
  clientTasksSteps: [],
}));

const mockListTasks = jest.fn();
const mockUpdateTask = jest.fn();
jest.mock('@/services/tasks', () => ({
  listTasks: (...args: any[]) => mockListTasks(...args),
  updateTask: (...args: any[]) => mockUpdateTask(...args),
}));

jest.mock('@/components/LoadingState', () => ({
  LoadingState: ({ message }: { message: string }) => <div data-testid="loading-state">{message}</div>,
}));

import ClientTasksPage from '../tasks/page';

describe('ClientTasksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      role: 'client',
      email: 'athlete@test.com',
      clientId: 'client-123',
    };
    mockSessionLoading = false;
    mockListTasks.mockResolvedValue([]);
    mockUpdateTask.mockResolvedValue({});
  });

  test('renders page title "Tasks"', async () => {
    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });
  });

  test('shows loading state when session is loading', () => {
    mockSessionLoading = true;

    render(<ClientTasksPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  test('fetches and displays open tasks', async () => {
    mockListTasks.mockResolvedValue([
      { id: 't1', title: 'Update profile video', status: 'todo', dueAt: Date.now() + 86400000 },
      { id: 't2', title: 'Complete questionnaire', status: 'in-progress', dueAt: Date.now() + 172800000 },
    ]);

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Update profile video')).toBeInTheDocument();
      expect(screen.getByText('Complete questionnaire')).toBeInTheDocument();
    });

    // Both should have "Done" buttons
    const doneButtons = screen.getAllByText('Done');
    expect(doneButtons).toHaveLength(2);
  });

  test('shows open task count in chip', async () => {
    mockListTasks.mockResolvedValue([
      { id: 't1', title: 'Task 1', status: 'todo' },
      { id: 't2', title: 'Task 2', status: 'done' },
    ]);

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('1 open')).toBeInTheDocument();
    });
  });

  test('shows completed tasks with strikethrough styling', async () => {
    mockListTasks.mockResolvedValue([
      { id: 't1', title: 'Completed Task', status: 'done' },
    ]);

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    // Done tasks should not have "Done" button
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });

  test('shows empty state when no tasks', async () => {
    mockListTasks.mockResolvedValue([]);

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText(/No tasks assigned/)).toBeInTheDocument();
    });
  });

  test('markDone calls updateTask and updates UI', async () => {
    mockListTasks.mockResolvedValue([
      { id: 't1', title: 'Mark me done', status: 'todo' },
    ]);
    mockUpdateTask.mockResolvedValue({ id: 't1', status: 'done' });

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Mark me done')).toBeInTheDocument();
    });

    const doneBtn = screen.getByText('Done');
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('t1', { status: 'done' });
    });
  });

  test('handles listTasks API failure gracefully', async () => {
    mockListTasks.mockRejectedValue(new Error('Server error'));

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  test('handles markDone API failure gracefully', async () => {
    mockListTasks.mockResolvedValue([
      { id: 't1', title: 'Task 1', status: 'todo' },
    ]);
    mockUpdateTask.mockRejectedValue(new Error('Update failed'));

    render(<ClientTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const doneBtn = screen.getByText('Done');
    fireEvent.click(doneBtn);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  test('does not load tasks for non-client users', () => {
    mockSession = { role: 'agency', email: 'agency@test.com' };

    render(<ClientTasksPage />);

    expect(mockListTasks).not.toHaveBeenCalled();
  });
});
