import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentLoginPage from '../agent-login/page';

// Mock useRouter and useSearchParams from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn(), }),
}));

describe('AgentLoginPage Component', () => {
  beforeEach(() => {
    render(<AgentLoginPage />);
  });

  it('validates email and phone as required fields', () => {
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/phone/i)).toBeRequired();
  });

  it('checks email input type is email', () => {
    const emailInput = screen.getByLabelText(/email/i);

    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('checks phone input type is tel', () => {
    const phoneInput = screen.getByLabelText(/phone/i);

    expect(phoneInput).toHaveAttribute('type', 'tel');
  });
});