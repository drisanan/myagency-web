import { render, screen } from '@testing-library/react';
import MarketingPage from '@/app/(public)/page';

describe('MarketingPage', () => {
  test('renders header, hero, and content', () => {
    render(<MarketingPage />);
    expect(screen.getAllByText(/Athlete Narrative/i).length).toBeGreaterThan(1);
    expect(screen.getByText(/Get recruited with Athlete Narrative/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});


