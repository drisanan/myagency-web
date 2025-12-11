import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import { CoachRosterTable } from '@/features/coach/CoachRosterTable';
import * as svc from '@/features/coach/service';

jest.spyOn(svc, 'getRoster');
jest.spyOn(svc, 'addNote');

describe('CoachRosterTable', () => {
  test('renders roster and submits note', async () => {
    (svc.getRoster as jest.Mock).mockResolvedValueOnce([{ id: 'p1', name: 'Player 1' }]);
    (svc.addNote as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(
      <TestProviders>
        <CoachRosterTable />
      </TestProviders>
    );

    expect(await screen.findByRole('row', { name: /player 1/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add note/i }));
    await userEvent.type(screen.getByRole('textbox', { name: /^note$/i }), 'Great effort');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(svc.addNote).toHaveBeenCalledWith({ athleteId: 'p1', text: 'Great effort' });
  });
});


