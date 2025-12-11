import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientProfilePage from '@/app/(app)/clients/[id]/page';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: 'c1' })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@/services/clients', () => ({
  getClient: jest.fn(async () => ({
    id: 'c1',
    firstName: 'Ava',
    lastName: 'Smith',
    sport: 'Football',
    profileImageUrl: '/avatar.png',
  })),
}));

jest.mock('@/services/mailStatus', () => ({
  getMailEntries: jest.fn(() => [
    {
      id: 'm1',
      clientId: 'c1',
      recipientFirstName: 'Coach',
      recipientLastName: 'Lee',
      university: 'State U',
      position: 'Head Coach',
      subject: 'Intro',
      body: 'Hello Coach',
      sentAt: 1710000000000,
    },
  ]),
}));

describe('ClientProfilePage', () => {
  test('renders profile header and emails list with expandable content', async () => {
    render(<ClientProfilePage />);

    expect(await screen.findByText(/Ava Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Football/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Sent/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Intro/i)).toBeInTheDocument();

    const viewBtn = screen.getByRole('button', { name: /View/i });
    fireEvent.click(viewBtn);
    await waitFor(() => {
      expect(screen.getByText(/Hello Coach/i)).toBeInTheDocument();
    });
  });
});

