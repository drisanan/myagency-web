import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import { RecruiterSearchList } from '@/features/recruiter/RecruiterSearchList';
import * as service from '@/features/recruiter/searchService';

jest.spyOn(service, 'searchAthletes');

describe('RecruiterSearchList', () => {
  test('renders rows and handles row click', async () => {
    (service.searchAthletes as jest.Mock).mockResolvedValueOnce([
      { id: 'a1', name: 'Jane Doe' },
      { id: 'a2', name: 'John Smith' }
    ]);
    const onSelect = jest.fn();
    render(
      <TestProviders>
        <RecruiterSearchList onSelect={onSelect} />
      </TestProviders>
    );
    expect(await screen.findByRole('row', { name: /jane doe/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('row', { name: /john smith/i }));
    expect(onSelect).toHaveBeenCalledWith({ id: 'a2', name: 'John Smith' });
  });
});


