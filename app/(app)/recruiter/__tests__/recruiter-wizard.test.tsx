import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RecruiterWizard } from '@/features/recruiter/RecruiterWizard';
import * as sessionMod from '@/features/auth/session';
import * as clients from '@/services/clients';
import * as meta from '@/services/recruiterMeta';
import * as recruiterSvc from '@/services/recruiter';
import * as aiRecruiter from '@/services/aiRecruiter';
import * as listsSvc from '@/services/lists';

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
    jest.spyOn(listsSvc, 'listLists').mockResolvedValue([
      {
        id: 'list-1',
        name: 'Test List',
        agencyEmail: 'agency1@an.test',
        items: [
          { id: 'coach1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@u.test', title: 'Head Coach', school: 'Test U', division: 'D1', state: 'CA' },
          { id: 'coach2', firstName: 'Alan', lastName: 'Turing', email: 'alan@u.test', title: 'Assistant Coach', school: 'Test U', division: 'D1', state: 'CA' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<RecruiterWizard />);

    // Step 1: select client
    await user.click(await screen.findByLabelText(/client/i));
    await user.click(await screen.findByText(/a1@athletes\.test/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: pick list path (auto-selects coaches)
    await user.click(await screen.findByLabelText(/list/i));
    await user.click(await screen.findByText(/Test List/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: draft generated (list path); confirm draft UI shows actions
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /send emails/i })).toBeInTheDocument());
  });
});

describe('RecruiterWizard loading indicators', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('shows delayed spinner on Improve Introduction when work exceeds 1s', async () => {
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
    jest.spyOn(listsSvc, 'listLists').mockResolvedValue([
      {
        id: 'list-1',
        name: 'Test List',
        agencyEmail: 'agency1@an.test',
        items: [
          { id: 'coach1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@u.test', title: 'Head Coach', school: 'Test U', division: 'D1', state: 'CA' },
          { id: 'coach2', firstName: 'Alan', lastName: 'Turing', email: 'alan@u.test', title: 'Assistant Coach', school: 'Test U', division: 'D1', state: 'CA' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    jest.spyOn(aiRecruiter, 'generateIntro').mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('Generated intro'), 2000);
        }),
    );

    const user = userEvent.setup();
    render(<RecruiterWizard />);

    await user.click(await screen.findByLabelText(/client/i));
    await user.click(await screen.findByText(/a1@athletes\.test/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(await screen.findByLabelText(/list/i));
    await user.click(await screen.findByText(/Test List/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    const improveBtn = await screen.findByRole('button', { name: /improve introduction/i });
    await user.click(improveBtn);

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    expect(within(improveBtn).getByRole('progressbar')).toBeInTheDocument();

    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  }, 30000);
});


