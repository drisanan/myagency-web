import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AgencyWizard } from '@/features/agencies/AgencyWizard';
import * as agencies from '@/services/agencies';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('AgencyWizard', () => {
  test('walks through steps and previews color', async () => {
    const user = userEvent.setup();
    jest.spyOn(agencies, 'upsertAgency').mockResolvedValue({ id: 'new-id' });
    render(<AgencyWizard />);

    // Basic info
    await user.type(screen.getByLabelText(/agency email/i), 'a@x.com');
    await user.type(screen.getByLabelText(/agency password/i), 'password123');
    await user.type(screen.getByLabelText(/agency name/i), 'Prime Test');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Owner info
    await user.type(screen.getByLabelText(/owner first name/i), 'Ava');
    await user.type(screen.getByLabelText(/owner last name/i), 'Clark');
    await user.type(screen.getByLabelText(/owner email/i), 'owner@x.com');
    await user.type(screen.getByLabelText(/owner phone number/i), '555-111-2222');
    expect(screen.getByText(/Owner name:/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));

    // System settings
    expect(screen.getByTestId('theme-preview-appbar')).toBeInTheDocument();
    const colorPreview = screen.getByTestId('theme-color-preview');
    expect(colorPreview).toHaveTextContent(/Current color:/i);
    const colorPicker = screen.getByLabelText(/agency color/i) as HTMLInputElement;
    fireEvent.change(colorPicker, { target: { value: '#ff5722' } });
    // Secondary color
    const secondaryPicker = screen.getByLabelText(/secondary color/i) as HTMLInputElement;
    fireEvent.change(secondaryPicker, { target: { value: '#3f51b5' } });
    expect(screen.getByTestId('theme-secondary-color-preview')).toHaveTextContent('#3f51b5');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Review + create
    await user.click(screen.getByRole('button', { name: /create agency/i }));
    expect(agencies.upsertAgency).toHaveBeenCalled();
  });
});


