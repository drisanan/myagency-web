import React from 'react';
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecruiterWizard } from '@/features/recruiter/RecruiterWizard';
import * as sess from '@/features/auth/session';
import * as clients from '@/services/clients';
import * as lists from '@/services/lists';
import * as meta from '@/services/recruiterMeta';
import * as recruiter from '@/services/recruiter';
import * as aiRecruiter from '@/services/aiRecruiter';
import * as mailStatus from '@/services/mailStatus';
import * as prompts from '@/services/prompts';

jest.setTimeout(20000);

function wrapper(children: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('RecruiterWizard loading indicators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(sess, 'useSession').mockReturnValue({
      session: { role: 'agency', email: 'agency1@an.test' } as any,
      setSession: jest.fn(),
      loading: false,
    } as any);
    jest.spyOn(clients, 'listClientsByAgencyEmail').mockResolvedValue([
      { id: 'c1', email: 'seed@example.com', sport: 'Football', firstName: 'Seed', lastName: 'Client' } as any,
    ]);
    jest.spyOn(lists, 'listLists').mockResolvedValue([
      {
        id: 'list-1',
        agencyEmail: 'agency1@an.test',
        name: 'Test List',
        items: [
          { id: 'coach-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@u.test', title: 'HC', school: 'Test U', division: 'D1', state: 'CA' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    jest.spyOn(meta, 'getDivisions').mockResolvedValue(['D1']);
    jest.spyOn(meta, 'getStates').mockResolvedValue([{ code: 'CA', name: 'California' }]);
    jest.spyOn(recruiter, 'listUniversities').mockResolvedValue([{ name: 'Test University' } as any]);
    jest.spyOn(recruiter, 'getUniversityDetails').mockResolvedValue({
      name: 'Test University',
      schoolInfo: { School: 'Test University', City: 'Test City', State: 'CA' },
      coaches: [{ id: 'coach-1', firstName: 'Ada', lastName: 'Lovelace', title: 'HC', email: 'ada@u.test' }],
    } as any);
    jest.spyOn(mailStatus, 'hasMailed').mockReturnValue(false);
    jest.spyOn(prompts, 'listPrompts').mockResolvedValue([
      { id: 'prompt-1', name: 'Intro Prompt', text: 'Prompt intro body' } as any,
    ]);
  });

  afterEach(() => {
  });

  test('shows delayed spinner/text on Improve Introduction after 1s', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.spyOn(aiRecruiter, 'generateIntro').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('Intro text'), 2000))
    );

    render(wrapper(<RecruiterWizard />));

    // Step 1: select client
    const clientSelect = await screen.findByLabelText(/client/i);
    await user.click(clientSelect);
    const option = await screen.findByText(/seed@example.com/i);
    await user.click(option);
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: pick list (skips division/state path)
    const listSelect = await screen.findByLabelText(/list/i);
    await user.click(listSelect);
    await user.click(await screen.findByText(/Test List/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Draft step: trigger Improve Introduction
    const improveBtn = await screen.findByRole('button', { name: /improve introduction/i });
    await user.click(improveBtn);

    // Immediately, text should remain original (no spinner yet)
    expect(screen.getByRole('button', { name: /improve introduction/i })).toBeInTheDocument();

    // After 1s delay, spinner/text should appear
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(await screen.findByRole('button', { name: /improving…/i })).toBeInTheDocument();

    // Resolve pending intro call
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // Final state returns to original label
    expect(await screen.findByRole('button', { name: /improve introduction/i })).toBeInTheDocument();
    jest.useRealTimers();
  });

  test(
    'sends multiple recipients when list has multiple coaches',
    async () => {
      const user = userEvent.setup();
    const fetchMock = jest.fn()
      // first call: google/status
      .mockResolvedValueOnce({ ok: true, json: async () => ({ connected: true }) } as any)
      // subsequent calls: drafts
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any);
    // draft call
    (global as any).fetch = fetchMock;

    jest.spyOn(lists, 'listLists').mockResolvedValue([
      {
        id: 'list-1',
        agencyEmail: 'agency1@an.test',
        name: 'Multi List',
        items: [
          { id: 'coach-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@u.test', title: 'HC', school: 'Test U', division: 'D1', state: 'CA' },
          { id: 'coach-2', firstName: 'Alan', lastName: 'Turing', email: 'alan@u.test', title: 'AC', school: 'Test U', division: 'D1', state: 'CA' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

      render(wrapper(<RecruiterWizard />));

      // Step 1: select client
      await user.click(await screen.findByLabelText(/client/i));
      await user.click(await screen.findByText(/seed@example.com/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: select list (auto-selects coaches and jumps)
      await user.click(await screen.findByLabelText(/list/i));
      await user.click(await screen.findByText(/Multi List/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // wait for gmail status fetch to resolve and button to enable
      await act(async () => {});
      const sendBtn = await screen.findByRole('button', { name: /send email/i });
      expect(sendBtn).toBeEnabled();

      // Click send and verify recipients include both coaches
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      await user.click(sendBtn);

      // last two calls (one per recipient)
      const calls = fetchMock.mock.calls.filter(([, init]) => (init as any)?.body);
      const toLists = calls
        .map(([, init]) => JSON.parse((init as any).body))
        .filter((b) => Array.isArray(b.recipients))
        .map((b) => b.recipients);
      expect(toLists).toEqual(expect.arrayContaining([[ 'ada@u.test' ], [ 'alan@u.test' ]]));
      expect(toLists.length).toBe(2);

      const bodies = calls
        .map(([, init]) => JSON.parse((init as any).body))
        .filter((b) => Array.isArray(b.recipients));
      const htmls = bodies.map((b) => b.html);
      expect(htmls[0]).toMatch(/Coach (Ada|Lovelace)|Ada|Lovelace/i);
      expect(htmls[1]).toMatch(/Coach (Alan|Turing)|Alan|Turing/i);
    },
    15000
  );

  test('shows sent-to-N confirmation after send', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn()
      // google/status
      .mockResolvedValueOnce({ ok: true, json: async () => ({ connected: true }) } as any)
      // send
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any);
    (global as any).fetch = fetchMock;

    render(wrapper(<RecruiterWizard />));

    // Step 1 select client
    const clientSelect = await screen.findByLabelText(/client/i);
    await user.click(clientSelect);
    await user.click(await screen.findByText(/seed@example.com/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2 select list
    const listSelect = await screen.findByLabelText(/list/i);
    await user.click(listSelect);
    await user.click(await screen.findByText(/Test List/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Send step
    const sendBtn = await screen.findByRole('button', { name: /send email/i });
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(sendBtn);

    const confirmation = await screen.findByTestId('send-confirmation');
    expect(confirmation).toHaveTextContent('Sent to 1 recipient');
  });

  test('WYSIWYG editor is rendered when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ connected: true }) } as any)
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any);
    (global as any).fetch = fetchMock;

    render(wrapper(<RecruiterWizard />));

    // Step 1: select client
    const clientSelect = await screen.findByLabelText(/client/i);
    await user.click(clientSelect);
    await user.click(await screen.findByText(/seed@example.com/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: select list
    const listSelect = await screen.findByLabelText(/list/i);
    await user.click(listSelect);
    await user.click(await screen.findByText(/Test List/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Draft step: verify edit button exists
    const editBtn = await screen.findByRole('button', { name: /edit/i });
    expect(editBtn).toBeInTheDocument();

    // Click edit to enable WYSIWYG editor
    await user.click(editBtn);

    // Verify WYSIWYG editor is rendered (using our mock)
    const quillEditor = await screen.findByTestId('mock-quill-editor');
    expect(quillEditor).toBeInTheDocument();

    // Verify "Done Editing" button appears
    const doneEditingBtn = screen.getByRole('button', { name: /done editing/i });
    expect(doneEditingBtn).toBeInTheDocument();

    // Click "Done Editing" to return to preview mode
    await user.click(doneEditingBtn);

    // Verify edit button is back
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
  });

  test('keeps prompt-based WYSIWYG edits after leaving edit mode', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ connected: true }) } as any)
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any);
    (global as any).fetch = fetchMock;

    render(wrapper(<RecruiterWizard />));

    await user.click(await screen.findByLabelText(/client/i));
    await user.click(await screen.findByText(/seed@example.com/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(await screen.findByLabelText(/list/i));
    await user.click(await screen.findByText(/Test List/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(await screen.findByLabelText(/saved prompts/i));
    await user.click(await screen.findByText(/intro prompt/i));
    expect(await screen.findByText(/prompt intro body/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^edit$/i }));
    const editor = await screen.findByTestId('quill-textarea');
    fireEvent.change(editor, { target: { value: 'WYSIWYG persistence check 2026-03-07' } });

    await user.click(screen.getByRole('button', { name: /done editing/i }));
    expect(await screen.findByText(/WYSIWYG persistence check 2026-03-07/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/schedule this campaign/i));
    expect(screen.getByText(/WYSIWYG persistence check 2026-03-07/i)).toBeInTheDocument();
  }, 60000);
});

