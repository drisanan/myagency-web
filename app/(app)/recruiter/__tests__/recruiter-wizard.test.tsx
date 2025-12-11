import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RecruiterWizard } from '@/features/recruiter/RecruiterWizard';
import * as sessionMod from '@/features/auth/session';
import * as clients from '@/services/clients';
import * as meta from '@/services/recruiterMeta';
import * as recruiterSvc from '@/services/recruiter';

describe('RecruiterWizard', () => {
  test('flows through client -> division/state -> schools -> details -> draft', async () => {
    jest.spyOn(sessionMod, 'useSession').mockReturnValue({
      session: { role: 'agency', email: 'agency1@an.test' } as any,
      setSession: jest.fn(),
      loading: false,
    } as any);
    jest.spyOn(clients, 'listClientsByAgencyEmail').mockResolvedValue([
      { id: 'c1', email: 'a1@athletes.test', sport: 'MensBasketball' } as any,
    ]);
    jest.spyOn(meta, 'getDivisions').mockResolvedValue(['D1']);
    jest.spyOn(meta, 'getStates').mockResolvedValue([{ code: 'CA', name: 'California' }]);
    jest.spyOn(recruiterSvc, 'listUniversities').mockResolvedValue([{ name: 'Cal Tech' }]);
    jest.spyOn(recruiterSvc, 'getUniversityDetails').mockResolvedValue({
      name: 'Cal Tech',
      city: 'Pasadena',
      state: 'CA',
      division: 'D1',
      coaches: [{ id: 'coach1', firstName: 'Ada', lastName: 'Lovelace', title: 'Head Coach', email: 'ada@caltech.edu' }],
    } as any);

    const user = userEvent.setup();
    render(<RecruiterWizard />);

    // Step 1: select client
    await user.click(await screen.findByLabelText(/client/i));
    await user.click(await screen.findByText(/a1@athletes\.test/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: select division and state; choose school card
    await user.click(await screen.findByLabelText(/division/i));
    await user.click(await screen.findByText('D1'));
    await user.click(screen.getByLabelText(/state/i));
    await user.click(await screen.findByText('California'));
    // choose school
    await user.click(await screen.findByText(/Cal Tech/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: select coach, proceed (button still labeled Next)
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: draft generated (button now "Generate"; content appears in pre)
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => expect(screen.getByText(/Cal Tech/)).toBeInTheDocument());
    expect(screen.getByText(/Cal Tech/)).toBeInTheDocument();
  });
});


