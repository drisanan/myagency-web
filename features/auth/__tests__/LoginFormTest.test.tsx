import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from '../LoginForm';

describe('LoginForm Component', () => {
  const handleSubmit = jest.fn();

  beforeEach(() => {
    render(<LoginForm onSubmit={handleSubmit} />);
  });

  it('validates email and phone as required fields', async () => {
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    expect(await screen.findByText(/email: required/i)).toBeInTheDocument();
    expect(await screen.findByText(/phone: required/i)).toBeInTheDocument();
  });

  it('validates proper email format', async () => {
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/email: invalid email/i)).toBeInTheDocument();
  });

  it('validates phone number as digits only', async () => {
    const phoneInput = screen.getByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: 'abc123' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/phone: phone must be digits only/i)).toBeInTheDocument();
  });
});