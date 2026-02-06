import { render, screen } from '@testing-library/react';
import MarketingPage from '@/app/(public)/page';

describe('MarketingPage', () => {
  test('renders header, hero, and content', () => {
    render(<MarketingPage />);
    // Header links
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    // Hero content
    expect(screen.getByText(/Your Brand\. Your System\./i)).toBeInTheDocument();
    // Intro section
    expect(screen.getByText(/The Complete Recruiting HQ/i)).toBeInTheDocument();
    // Solution section
    expect(screen.getByText(/Built for Advisors, Directors, and Clubs/i)).toBeInTheDocument();
  });
});
