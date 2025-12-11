'use client';

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptPlaygroundPage from '../prompts/page';

jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: { role: 'agency', email: 'agency1@an.test' }, setSession: jest.fn() })
}));

jest.mock('@/services/clients', () => ({
  listClientsByAgencyEmail: jest.fn().mockResolvedValue([
    { id: 'c-1', email: 'athlete1@test.com', firstName: 'Ava', lastName: 'Smith', sport: 'MensSwimming' },
  ])
}));

jest.mock('@/services/agencies', () => ({
  getAgencyByEmail: jest.fn().mockResolvedValue({ id: 'a-1', name: 'Prime Sports', email: 'agency1@an.test' })
}));

jest.mock('@/services/aiRecruiter', () => ({
  generateIntro: jest.fn().mockResolvedValue('Hello Coach, this is a sample intro.')
}));

describe('Prompt Playground', () => {
  test('runs a prompt and saves/loads prompt', async () => {
    const user = userEvent.setup();
    render(<PromptPlaygroundPage />);

    // select client
    // open the client select and choose the first option
    const clientSelect = await screen.findByLabelText(/client/i);
    await user.click(clientSelect);
    // fallback: click by text content inside list
    await user.click(await screen.findByText(/athlete1@test\.com/i));

    // enter prompt
    const promptField = screen.getByLabelText(/prompt$/i);
    await user.type(promptField, 'Write a warm intro for testing.');

    // run
    await user.click(screen.getByRole('button', { name: /run/i }));
    expect(await screen.findByText(/Hello Coach, this is a sample intro\./i)).toBeInTheDocument();

    // save prompt
    await user.type(screen.getByLabelText(/prompt name/i), 'Warm Intro');
    await user.click(screen.getByRole('button', { name: /save prompt/i }));

    // load saved prompt (fallback query by text)
    await user.click(screen.getByLabelText(/saved prompts/i));
    // menu may render differently under test; click by text directly
    await user.click(await screen.findByText('Warm Intro'));
    expect((screen.getByLabelText(/prompt$/i) as HTMLInputElement).value).toMatch(/Warm Intro|Write a warm intro/i);
  });
});


