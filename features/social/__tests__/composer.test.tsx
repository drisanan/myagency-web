import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import { SocialComposer } from '@/features/social/SocialComposer';
import * as svc from '@/features/social/service';

jest.spyOn(svc, 'generateSharePreview');

describe('SocialComposer', () => {
  test('composes text and shows preview image', async () => {
    (svc.generateSharePreview as jest.Mock).mockResolvedValueOnce({ url: 'https://cdn.example.com/preview.png' });
    render(
      <TestProviders>
        <SocialComposer />
      </TestProviders>
    );
    await userEvent.type(screen.getByLabelText(/caption/i), 'Great workout');
    await userEvent.click(screen.getByRole('button', { name: /preview/i }));
    expect(svc.generateSharePreview).toHaveBeenCalledWith({ caption: 'Great workout' });
    expect(await screen.findByRole('img', { name: /share preview/i })).toHaveAttribute('src', 'https://cdn.example.com/preview.png');
  });
});


