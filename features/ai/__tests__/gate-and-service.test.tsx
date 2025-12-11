import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import { AICounselor } from '@/features/ai/AICounselor';
import { AICounselorGate } from '@/features/ai/AICounselorGate';
import * as svc from '@/features/ai/service';
import * as config from '@/config';

jest.spyOn(svc, 'askCounselor');
jest.spyOn(config, 'getTenantRegistry');

function EnabledProviders({ children }: { children: React.ReactNode }) {
  const reg = config.getTenantRegistry();
  reg.default.flags.aiCounselor = true;
  return <TestProviders>{children}</TestProviders>;
}

describe('AI Counselor', () => {
  test('gate blocks when disabled', () => {
    const reg = config.getTenantRegistry();
    reg.default.flags.aiCounselor = false;
    render(
      <TestProviders>
        <AICounselorGate><AICounselor /></AICounselorGate>
      </TestProviders>
    );
    expect(screen.getByText(/ai counselor is disabled/i)).toBeInTheDocument();
  });

  test('calls service when enabled', async () => {
    (svc.askCounselor as jest.Mock).mockResolvedValueOnce({ answer: 'Result' });
    render(
      <EnabledProviders>
        <AICounselorGate><AICounselor /></AICounselorGate>
      </EnabledProviders>
    );
    await userEvent.type(screen.getByLabelText(/question/i), 'How to improve speed?');
    await userEvent.click(screen.getByRole('button', { name: /ask/i }));
    expect(svc.askCounselor).toHaveBeenCalledWith({ question: 'How to improve speed?' });
    expect(await screen.findByText(/result/i)).toBeInTheDocument();
  });
});


