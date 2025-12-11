'use client';

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListsPage from '../page';

jest.mock('@/features/auth/session', () => ({
  useSession: () => ({ session: { role: 'agency', email: 'agency1@an.test' }, setSession: jest.fn() })
}));

jest.mock('@/features/recruiter/divisionMapping', () => ({
  getSports: () => ['Football', 'MensSwimming']
}));

jest.mock('@/services/recruiterMeta', () => ({
  getDivisions: jest.fn().mockResolvedValue(['Division 1', 'Division 2', 'Division 3']),
  getStates: jest.fn().mockResolvedValue([{ code: 'CA', name: 'California' }])
}));

jest.mock('@/services/recruiter', () => ({
  DIVISION_API_MAPPING: { 'Division 1': 'division-1' },
  listUniversities: jest.fn().mockResolvedValue([{ name: 'Cal Tech' }]),
  getUniversityDetails: jest.fn().mockResolvedValue({
    name: 'Cal Tech',
    schoolInfo: { School: 'Cal Tech', City: 'Pasadena', State: 'CA' },
    coaches: [
      { id: 'c1', firstName: 'Jim', lastName: 'Reed', email: 'jim@caltech.edu', title: 'HC' },
      { id: 'c2', firstName: 'Ana', lastName: 'Lee', email: 'alee@caltech.edu', title: 'AC' },
    ]
  })
}));

describe('Lists page', () => {
  test('adds coaches from school and saves a list', async () => {
    const user = userEvent.setup();
    render(<ListsPage />);

    // sport
    await user.click(screen.getByLabelText(/sport/i));
    await user.click(await screen.findByText(/MensSwimming/i));
    // division
    await user.click(screen.getByLabelText(/division/i));
    await user.click(await screen.findByText(/Division 1/i));
    // state
    await user.click(screen.getByLabelText(/state/i));
    await user.click(await screen.findByText(/California/i));

    // pick school
    await screen.findByText('Universities');
    await user.click(await screen.findByText(/Cal Tech/i));
    // add first coach
    await user.click(await screen.findByLabelText(/Jim Reed/i));
    // list name
    await user.type(screen.getByLabelText(/list name/i), 'CA D1 Swimmers');
    // save
    await user.click(screen.getByRole('button', { name: /save list/i }));
    expect(await screen.findByText(/Saved Lists/i)).toBeInTheDocument();
    expect(await screen.findByText(/CA D1 Swimmers/i)).toBeInTheDocument();
  });

  test('adds manual coach and updates list', async () => {
    const user = userEvent.setup();
    render(<ListsPage />);
    await user.type(screen.getByLabelText(/list name/i), 'Manual List');
    await user.type(screen.getByLabelText(/full name/i), 'Pat Green');
    await user.type(screen.getByLabelText(/^email$/i), 'pat@school.edu');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.click(screen.getByRole('button', { name: /save list/i }));
    expect(await screen.findByText(/Manual List/i)).toBeInTheDocument();
  });
});


