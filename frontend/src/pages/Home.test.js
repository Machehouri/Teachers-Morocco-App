import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders "Find The Best Private Teachers In Morocco" heading', () => {
  render(<Home />);
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading.textContent).toContain('Find The Best');
  expect(heading.textContent).toContain('Private Teachers');
  expect(heading.textContent).toContain('In Morocco');
});

test('renders "Explore Teachers" and "Become a Teacher" buttons', () => {
  render(<Home />);
  expect(screen.getByText(/Explore Teachers/i)).toBeInTheDocument();
  expect(screen.getByText(/Become a Teacher/i)).toBeInTheDocument();
});

test('renders the "Why Choose TeachMe?" section', () => {
  render(<Home />);
  expect(screen.getByText(/Why Choose TeachMe/i)).toBeInTheDocument();
});
