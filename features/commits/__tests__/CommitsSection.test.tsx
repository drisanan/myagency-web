import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CommitsSection } from '../CommitsSection';
import { TestProviders } from '@/tests/TestProviders';
import * as commitsSvc from '@/services/commits';

describe('CommitsSection', () => {
  const listMock = jest.spyOn(commitsSvc, 'listCommits');
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = originalFetch;
    listMock.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('renders initial data immediately and refetches in background', async () => {
    const initialRecent = [{ id: 'local-rec', sport: 'Football', list: 'recent', name: 'Local Recent' } as any];
    const initialTop = [{ id: 'local-top', sport: 'Football', list: 'top', rank: 1, name: 'Local Top' } as any];
    listMock.mockImplementation((_, list) => (list === 'recent' ? initialRecent : initialTop));

    const fetchMock = jest.fn(async (url: RequestInfo | URL) => {
      const isRecent = String(url).includes('list=recent');
      const payload = isRecent
        ? [{ id: 'remote-rec', sport: 'Football', list: 'recent', name: 'Remote Recent' }]
        : [{ id: 'remote-top', sport: 'Football', list: 'top', rank: 1, name: 'Remote Top' }];
      return {
        ok: true,
        json: async () => ({ data: payload }),
      } as Response;
    });
    global.fetch = fetchMock as any;

    render(
      <TestProviders>
        <CommitsSection sport="Football" />
      </TestProviders>,
    );

    // Immediate render uses initial data
    expect(screen.getByText(/Local Recent/i)).toBeInTheDocument();
    expect(screen.getByText(/Local Top/i)).toBeInTheDocument();

    // Background fetch runs and updates data
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/Remote Recent/i)).toBeInTheDocument();
    expect(await screen.findByText(/Remote Top/i)).toBeInTheDocument();
  });
});


