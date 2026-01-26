import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentsPage from '../page';

jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: { email: 'test@example.com' }, loading: false })
}));

jest.mock('@/services/agents', () => ({
  listAgents: jest.fn(() => Promise.resolve([])),
  upsertAgent: jest.fn(),
  deleteAgent: jest.fn(),
}));

describe('AgentsPage Component', () => {
  beforeEach(() => {
    render(<AgentsPage />);
  });

  it('should require email and phone when creating a new agent', async () => {
    const newAgentButton = await screen.findByRole('button', { name: /new agent/i });
    fireEvent.click(newAgentButton);

    const saveButton = await screen.findByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => expect(screen.getByText(/first name, last name, and email are required/i)).toBeInTheDocument());
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  });

  it('should validate email as type email', async () => {
    const { container } = render(<AgentsPage />);
    const emailInput = container.querySelector('input[type="email"]');

    expect(emailInput).toBeInTheDocument();
  });

  it('should validate phone as type tel', async () => {
    const { container } = render(<AgentsPage />);
    const phoneInput = container.querySelector('input[type="tel"]');

    expect(phoneInput).toBeInTheDocument();
  });
});